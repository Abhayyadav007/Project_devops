/*
  Warnings:

  - Added the required column `validatorId` to the `Mail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mail" ADD COLUMN     "validatorId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Validator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "TeacherId" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Validator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Validator_TeacherId_key" ON "Validator"("TeacherId");

-- AddForeignKey
ALTER TABLE "Mail" ADD CONSTRAINT "Mail_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "Validator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
