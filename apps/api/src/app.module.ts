import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'nestjs-prisma';
import { FlowModule } from './flow/flow.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule.forRoot({ isGlobal: true }), AuthModule, FlowModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
