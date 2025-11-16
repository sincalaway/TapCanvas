import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import { JwtGuard } from '../auth/jwt.guard'
import { SoraService } from './sora.service'

@UseGuards(JwtGuard)
@Controller('sora')
export class SoraController {
  constructor(private readonly service: SoraService) {}

  @Get('drafts')
  getDrafts(
    @Query('tokenId') tokenId: string | undefined,
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: any,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) || undefined : undefined
    return this.service.getDrafts(String(req.user.sub), tokenId, cursor, parsedLimit)
  }

  @Get('drafts/delete')
  deleteDraft(
    @Query('tokenId') tokenId: string,
    @Query('draftId') draftId: string,
    @Req() req: any,
  ) {
    return this.service.deleteDraft(String(req.user.sub), tokenId, draftId)
  }

  @Get('characters')
  getCharacters(
    @Query('tokenId') tokenId: string | undefined,
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: any,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) || undefined : undefined
    return this.service.getCharacters(String(req.user.sub), tokenId, cursor, parsedLimit)
  }

  @Get('characters/delete')
  deleteCharacter(
    @Query('tokenId') tokenId: string,
    @Query('characterId') characterId: string,
    @Req() req: any,
  ) {
    return this.service.deleteCharacter(String(req.user.sub), tokenId, characterId)
  }

  @Post('characters/check-username')
  checkCharacterUsername(
    @Body() body: { tokenId?: string; username: string },
    @Req() req: any,
  ) {
    const { tokenId, username } = body
    return this.service.checkCharacterUsername(String(req.user.sub), tokenId, username)
  }

  @Post('characters/update')
  updateCharacter(
    @Body()
    body: {
      tokenId: string
      characterId: string
      username?: string
      display_name?: string | null
      profile_asset_pointer?: any
    },
    @Req() req: any,
  ) {
    const { tokenId, characterId, ...rest } = body
    return this.service.updateCharacter(String(req.user.sub), tokenId, characterId, rest)
  }
}
