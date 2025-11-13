import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import axios from 'axios'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService, private readonly prisma: PrismaService) {}

  async exchangeGithubCode(code: string) {
    const client_id = process.env.GITHUB_CLIENT_ID || ''
    const client_secret = process.env.GITHUB_CLIENT_SECRET || ''
    const tokenResp = await axios.post(
      'https://github.com/login/oauth/access_token',
      { client_id, client_secret, code },
      { headers: { Accept: 'application/json' } },
    )
    const access_token = tokenResp.data?.access_token as string
    if (!access_token) throw new Error('no access token')
    const user = (await axios.get('https://api.github.com/user', { headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/vnd.github+json' } })).data
    const emailRes = await axios.get('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${access_token}` } }).catch(() => ({ data: [] }))
    const primaryEmail = Array.isArray(emailRes.data) ? (emailRes.data.find((e: any) => e.primary)?.email || emailRes.data[0]?.email) : undefined
    // upsert user
    await this.prisma.user.upsert({
      where: { id: String(user.id) },
      update: { login: user.login, name: user.name || user.login, avatarUrl: user.avatar_url, email: primaryEmail || undefined },
      create: { id: String(user.id), login: user.login, name: user.name || user.login, avatarUrl: user.avatar_url, email: primaryEmail || undefined },
    })
    const payload = { sub: String(user.id), login: user.login, name: user.name, avatarUrl: user.avatar_url, email: primaryEmail }
    const token = await this.jwt.signAsync(payload)
    return { token, user: payload }
  }
}
