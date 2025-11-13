import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest()
    const auth = req.headers['authorization'] as string | undefined
    if (!auth || !auth.startsWith('Bearer ')) throw new UnauthorizedException('missing token')
    const token = auth.slice(7)
    try {
      const payload = await this.jwt.verifyAsync(token)
      req.user = payload
      return true
    } catch {
      throw new UnauthorizedException('invalid token')
    }
  }
}

