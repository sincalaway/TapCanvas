import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth/github')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Frontend callback handler: /oauth/github?code=...
  @Get('callback')
  async callback(@Query('code') code: string) {
    return this.auth.exchangeGithubCode(code)
  }

  // Direct exchange endpoint
  @Post('exchange')
  async exchange(@Body() body: { code: string }) {
    return this.auth.exchangeGithubCode(body.code)
  }
}

