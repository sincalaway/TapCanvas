import { Module } from '@nestjs/common'
import { SoraController } from './sora.controller'
import { SoraService } from './sora.service'

@Module({
  controllers: [SoraController],
  providers: [SoraService],
})
export class SoraModule {}

