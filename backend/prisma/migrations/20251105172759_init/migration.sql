-- CreateTable
CREATE TABLE "Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "publishedYear" INTEGER NOT NULL,
    "coverImage" TEXT,
    "ownerAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" INTEGER NOT NULL,
    "userAddress" TEXT NOT NULL,
    "reviewText" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "reviewHash" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BorrowRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" INTEGER NOT NULL,
    "borrowerAddress" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "txHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BorrowRequest_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Review_bookId_idx" ON "Review"("bookId");

-- CreateIndex
CREATE INDEX "Review_userAddress_idx" ON "Review"("userAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookId_userAddress_key" ON "Review"("bookId", "userAddress");

-- CreateIndex
CREATE INDEX "BorrowRequest_bookId_idx" ON "BorrowRequest"("bookId");

-- CreateIndex
CREATE INDEX "BorrowRequest_borrowerAddress_idx" ON "BorrowRequest"("borrowerAddress");

-- CreateIndex
CREATE INDEX "BorrowRequest_status_idx" ON "BorrowRequest"("status");
