/*
  Warnings:

  - Added the required column `ownerId` to the `ModelProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ModelToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ModelProvider" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ModelToken" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ModelProvider" ADD CONSTRAINT "ModelProvider_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelToken" ADD CONSTRAINT "ModelToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
