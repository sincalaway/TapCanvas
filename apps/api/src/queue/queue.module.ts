import { Global, Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'flow-execution',
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
