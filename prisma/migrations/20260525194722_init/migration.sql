-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('COPPER', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'EMERALD', 'KOBOLT');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "ranking" "Rank" NOT NULL DEFAULT 'COPPER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
