/*
  Warnings:

  - You are about to drop the column `is_active` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "otp" ALTER COLUMN "expires" SET DEFAULT now() + interval '2 minutes';

-- AlterTable
ALTER TABLE "product" DROP COLUMN "is_active",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_active",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;
