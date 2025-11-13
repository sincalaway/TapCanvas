import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { FlowService } from './flow.service'

@Controller('flows')
export class FlowController {
  constructor(private readonly service: FlowService) {}

  @Get()
  list() {
    return this.service.list()
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id)
  }

  @Post()
  upsert(@Body() body: { id?: string; name: string; data: any }) {
    return this.service.upsert(body)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

