-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" INTEGER NOT NULL,
    "buyerAddress" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Purchase_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_txHash_key" ON "Purchase"("txHash");

-- CreateIndex
CREATE INDEX "Purchase_bookId_idx" ON "Purchase"("bookId");

-- CreateIndex
CREATE INDEX "Purchase_buyerAddress_idx" ON "Purchase"("buyerAddress");

-- CreateIndex
CREATE INDEX "Purchase_txHash_idx" ON "Purchase"("txHash");
