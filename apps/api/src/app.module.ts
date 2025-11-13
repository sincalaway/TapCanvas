import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'nestjs-prisma';
import { FlowModule } from './flow/flow.module';

@Module({
  imports: [PrismaModule.forRoot({ isGlobal: true }), FlowModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
