/*
  Warnings:

  - You are about to drop the column `userId` on the `ImageUpload` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `usage_logs` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - Added the required column `clerkId` to the `ImageUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerkId` to the `usage_logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ImageUpload" DROP CONSTRAINT "ImageUpload_userId_fkey";

-- DropIndex
DROP INDEX "public"."users_email_key";

-- AlterTable
ALTER TABLE "ImageUpload" DROP COLUMN "userId",
ADD COLUMN     "clerkId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "usage_logs" DROP COLUMN "userId",
ADD COLUMN     "clerkId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email",
ALTER COLUMN "name" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ImageUpload" ADD CONSTRAINT "ImageUpload_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
