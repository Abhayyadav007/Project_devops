/*
  Warnings:

  - You are about to drop the column `userId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `TeacherId` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `TeacherId` on the `Validator` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacherId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[validatorId]` on the table `Validator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Validator` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdByAdminId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByAdminId` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Validator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validatorId` to the `Validator` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Student_userId_key";

-- DropIndex
DROP INDEX "Teacher_TeacherId_key";

-- DropIndex
DROP INDEX "Validator_TeacherId_key";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "userId",
ADD COLUMN     "createdByAdminId" INTEGER NOT NULL,
ADD COLUMN     "studentId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "TeacherId",
ADD COLUMN     "createdByAdminId" INTEGER NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "teacherId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Validator" DROP COLUMN "TeacherId",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "validatorId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "UpperManagement" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "upperManagementId" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdByValidatorId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpperManagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "adminId" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdByUpperManagementId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UpperManagement_upperManagementId_key" ON "UpperManagement"("upperManagementId");

-- CreateIndex
CREATE UNIQUE INDEX "UpperManagement_email_key" ON "UpperManagement"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_adminId_key" ON "Admin"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_teacherId_key" ON "Teacher"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Validator_validatorId_key" ON "Validator"("validatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Validator_email_key" ON "Validator"("email");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpperManagement" ADD CONSTRAINT "UpperManagement_createdByValidatorId_fkey" FOREIGN KEY ("createdByValidatorId") REFERENCES "Validator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_createdByUpperManagementId_fkey" FOREIGN KEY ("createdByUpperManagementId") REFERENCES "UpperManagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
