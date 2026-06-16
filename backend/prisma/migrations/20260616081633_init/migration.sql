-- CreateTable
CREATE TABLE "Mess" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "manager_name" TEXT NOT NULL DEFAULT '',
    "manager_email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mess_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "room_no" TEXT NOT NULL DEFAULT '',
    "rent" REAL NOT NULL DEFAULT 0,
    "join_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT "Member_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "Mess" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "breakfast" BOOLEAN NOT NULL DEFAULT false,
    "lunch" BOOLEAN NOT NULL DEFAULT false,
    "dinner" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Meal_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mess_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "receipt_url" TEXT NOT NULL DEFAULT '',
    "expense_date" DATETIME NOT NULL,
    "paid_by" TEXT NOT NULL DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Expense_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "Mess" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expense_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ExpenseCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "payment_date" DATETIME NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'cash',
    "reference" TEXT NOT NULL DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlySettlement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "meal_count" REAL NOT NULL,
    "meal_rate" REAL NOT NULL,
    "meal_cost" REAL NOT NULL,
    "rent" REAL NOT NULL,
    "utility_share" REAL NOT NULL,
    "payment_total" REAL NOT NULL,
    "total_due" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "MonthlySettlement_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "settlement_id" INTEGER NOT NULL,
    "member_id" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "pdf_path" TEXT NOT NULL,
    "email_sent" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sent_at" DATETIME,
    "error_message" TEXT NOT NULL DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailLog_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mess_id" INTEGER NOT NULL,
    "breakfast_weight" REAL NOT NULL DEFAULT 0.5,
    "lunch_weight" REAL NOT NULL DEFAULT 1.0,
    "dinner_weight" REAL NOT NULL DEFAULT 1.0,
    "auto_email_enabled" BOOLEAN NOT NULL DEFAULT false,
    "auto_close_enabled" BOOLEAN NOT NULL DEFAULT false,
    "smtp_host" TEXT NOT NULL DEFAULT '',
    "smtp_port" INTEGER NOT NULL DEFAULT 587,
    "smtp_username" TEXT NOT NULL DEFAULT '',
    "smtp_password" TEXT NOT NULL DEFAULT '',
    "smtp_from" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "language" TEXT NOT NULL DEFAULT 'en',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Setting_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "Mess" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Meal_member_id_date_idx" ON "Meal"("member_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_name_key" ON "ExpenseCategory"("name");

-- CreateIndex
CREATE INDEX "Expense_mess_id_expense_date_idx" ON "Expense"("mess_id", "expense_date");

-- CreateIndex
CREATE INDEX "Payment_member_id_payment_date_idx" ON "Payment"("member_id", "payment_date");

-- CreateIndex
CREATE INDEX "MonthlySettlement_month_year_idx" ON "MonthlySettlement"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySettlement_member_id_month_year_key" ON "MonthlySettlement"("member_id", "month", "year");

-- CreateIndex
CREATE INDEX "Invoice_member_id_month_year_idx" ON "Invoice"("member_id", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_mess_id_key" ON "Setting"("mess_id");
