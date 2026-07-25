-- Sole trader expense & invoice tracker — MySQL schema
-- Charset/collation set explicitly so client names, descriptions etc. handle
-- accented characters and emoji-adjacent input without surprises later.

CREATE DATABASE IF NOT EXISTS sole_tracker
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sole_tracker;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email           VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  business_name   VARCHAR(255) NOT NULL,
  vat_registered  BOOLEAN NOT NULL DEFAULT FALSE,
  vat_number      VARCHAR(20) NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- sessions (used by express-mysql-session for express-session)
-- ---------------------------------------------------------------------------
CREATE TABLE sessions (
  session_id  VARCHAR(128) NOT NULL PRIMARY KEY,
  expires     INT UNSIGNED NOT NULL,
  data        MEDIUMTEXT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
CREATE TABLE clients (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NULL,
  address     VARCHAR(500) NULL,
  phone       VARCHAR(50) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_clients_user (user_id),
  CONSTRAINT fk_clients_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- expense_categories
-- Seeded with HMRC-style categories; user_id NULL = global/default category,
-- non-NULL = a category a specific user added themselves.
-- ---------------------------------------------------------------------------
CREATE TABLE expense_categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NULL,
  name        VARCHAR(100) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_categories_user (user_id),
  CONSTRAINT fk_categories_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- expenses
-- amount_pence stored as an integer to avoid floating point rounding issues.
-- tax_year stored redundantly (e.g. "2025/26") to keep reporting queries
-- simple, since UK tax years run April to April rather than calendar year.
-- ---------------------------------------------------------------------------
CREATE TABLE expenses (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  category_id     INT UNSIGNED NULL,
  date            DATE NOT NULL,
  tax_year        VARCHAR(7) NOT NULL,
  description     VARCHAR(500) NOT NULL,
  amount_pence    INT UNSIGNED NOT NULL,
  vat_pence       INT UNSIGNED NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_expenses_user (user_id),
  KEY idx_expenses_category (category_id),
  KEY idx_expenses_user_date (user_id, date),
  KEY idx_expenses_tax_year (user_id, tax_year),
  CONSTRAINT fk_expenses_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_expenses_category
    FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- receipts
-- ---------------------------------------------------------------------------
CREATE TABLE receipts (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  expense_id      INT UNSIGNED NOT NULL,
  file_url        VARCHAR(1000) NOT NULL,
  original_name   VARCHAR(255) NULL,
  uploaded_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_receipts_expense (expense_id),
  CONSTRAINT fk_receipts_expense
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- invoices
-- invoice_number is unique per user, not globally, since two different
-- traders will both want to start numbering at "INV-0001".
-- ---------------------------------------------------------------------------
CREATE TABLE invoices (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  client_id       INT UNSIGNED NOT NULL,
  invoice_number  VARCHAR(50) NOT NULL,
  issue_date      DATE NOT NULL,
  due_date        DATE NOT NULL,
  status          ENUM('draft', 'sent', 'paid', 'overdue') NOT NULL DEFAULT 'draft',
  vat_registered  BOOLEAN NOT NULL DEFAULT FALSE,
  notes           VARCHAR(1000) NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_invoices_user_number (user_id, invoice_number),
  KEY idx_invoices_user (user_id),
  KEY idx_invoices_client (client_id),
  KEY idx_invoices_status (user_id, status),
  CONSTRAINT fk_invoices_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_invoices_client
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- invoice_line_items
-- ---------------------------------------------------------------------------
CREATE TABLE invoice_line_items (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id          INT UNSIGNED NOT NULL,
  description         VARCHAR(500) NOT NULL,
  quantity            DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price_pence    INT UNSIGNED NOT NULL,
  sort_order          SMALLINT UNSIGNED NOT NULL DEFAULT 0,

  KEY idx_line_items_invoice (invoice_id),
  CONSTRAINT fk_line_items_invoice
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- payments
-- Supports partial payments against an invoice — sum(payments.amount_pence)
-- vs the invoice total tells you whether it's fully settled.
-- ---------------------------------------------------------------------------
CREATE TABLE payments (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id      INT UNSIGNED NOT NULL,
  amount_pence    INT UNSIGNED NOT NULL,
  paid_date       DATE NOT NULL,
  method          VARCHAR(50) NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_payments_invoice (invoice_id),
  CONSTRAINT fk_payments_invoice
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Seed data: default HMRC-style expense categories (global, user_id = NULL)
-- ---------------------------------------------------------------------------
INSERT INTO expense_categories (user_id, name) VALUES
  (NULL, 'Travel'),
  (NULL, 'Office supplies'),
  (NULL, 'Equipment'),
  (NULL, 'Software'),
  (NULL, 'Marketing'),
  (NULL, 'Professional fees'),
  (NULL, 'Subcontractor costs'),
  (NULL, 'Other');
