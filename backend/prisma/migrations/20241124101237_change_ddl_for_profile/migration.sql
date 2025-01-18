/*
  Warnings:

  - You are about to drop the `profile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `profile_photo_path` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "profile" DROP CONSTRAINT "profile_user_id_fk";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "full_name" VARCHAR(255),
ADD COLUMN     "profile_photo_path" VARCHAR(255) NOT NULL,
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "work_history" TEXT;

-- DropTable
DROP TABLE "profile";
