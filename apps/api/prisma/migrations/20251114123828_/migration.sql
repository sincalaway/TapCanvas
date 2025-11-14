-- CreateTable
CREATE TABLE "ModelEndpoint" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelEndpoint_providerId_key_key" ON "ModelEndpoint"("providerId", "key");

-- AddForeignKey
ALTER TABLE "ModelEndpoint" ADD CONSTRAINT "ModelEndpoint_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ModelProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
