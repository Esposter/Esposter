-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "noPoints" INTEGER NOT NULL DEFAULT 0,
    "noComments" INTEGER NOT NULL DEFAULT 0,
    "ranking" DOUBLE PRECISION NOT NULL,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "creatorId" TEXT NOT NULL,
    "depth" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
