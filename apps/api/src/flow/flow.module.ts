import { Module } from '@nestjs/common'
import { FlowService } from './flow.service'
import { FlowController } from './flow.controller'
import { FlowProcessor } from './flow.processor'

@Module({
  providers: [FlowService, FlowProcessor],
  controllers: [FlowController],
})
export class FlowModule {}
