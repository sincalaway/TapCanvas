-- CreateTable
CREATE TABLE "ExternalDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "remoteId" TEXT NOT NULL,
    "title" TEXT,
    "prompt" TEXT,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalDraft_userId_provider_remoteId_key" ON "ExternalDraft"("userId", "provider", "remoteId");

-- AddForeignKey
ALTER TABLE "ExternalDraft" ADD CONSTRAINT "ExternalDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
