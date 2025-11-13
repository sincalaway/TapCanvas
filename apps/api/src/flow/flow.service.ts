import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class FlowService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.flow.findMany({ orderBy: { updatedAt: 'desc' } })
  }

  get(id: string) {
    return this.prisma.flow.findUnique({ where: { id } })
  }

  async upsert(input: { id?: string; name: string; data: any }) {
    if (input.id) {
      return this.prisma.flow.update({ where: { id: input.id }, data: { name: input.name, data: input.data } })
    }
    return this.prisma.flow.create({ data: { name: input.name, data: input.data } })
  }

  remove(id: string) {
    return this.prisma.flow.delete({ where: { id } })
  }
}

