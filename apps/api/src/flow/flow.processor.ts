import { Process, Processor } from '@nestjs/bull'
import type { Job } from 'bull'
import { PrismaService } from 'nestjs-prisma'

@Processor('flow-execution')
export class FlowProcessor {
  constructor(private readonly prisma: PrismaService) {}

  @Process('run')
  async handle(job: Job<{ executionId: string; flowId: string; userId: string; data: any }>) {
    const { executionId } = job.data

    await this.prisma.flowExecution.update({
      where: { id: executionId },
      data: { status: 'RUNNING' },
    })

    await this.prisma.flowExecutionLog.create({
      data: {
        executionId,
        level: 'info',
        message: 'Execution started (Bull queue)',
      },
    })

    // TODO: translate data (TapCanvas flow JSON) into real execution steps.

    await this.prisma.flowExecutionLog.create({
      data: {
        executionId,
        level: 'info',
        message: 'Execution finished (stub)',
      },
    })

    await this.prisma.flowExecution.update({
      where: { id: executionId },
      data: { status: 'SUCCESS' },
    })
  }
}

