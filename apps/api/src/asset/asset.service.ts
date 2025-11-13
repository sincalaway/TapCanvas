import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, projectId?: string) {
    return this.prisma.asset.findMany({ where: { ownerId: String(userId), ...(projectId ? { projectId } : {}) }, orderBy: { updatedAt: 'desc' } })
  }

  create(userId: string, input: { name: string; data: any; projectId?: string|null }) {
    return this.prisma.asset.create({ data: { name: input.name, data: input.data as any, ownerId: String(userId), projectId: input.projectId || undefined } })
  }

  rename(userId: string, id: string, name: string) {
    return this.prisma.asset.update({ where: { id }, data: { name } })
  }

  remove(userId: string, id: string) {
    return this.prisma.asset.delete({ where: { id } })
  }
}

