-- backend/init.sql
SET NAMES 'utf8mb4';
CREATE DATABASE IF NOT EXISTS `groupbuy`;
USE `groupbuy`;

CREATE TABLE IF NOT EXISTS `users` (
  id INT AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  join_date TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uc_email UNIQUE(email),
  PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS `products` (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `group_buys` (
  id VARCHAR(36) PRIMARY KEY,
  leader_id INT NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  target_quantity INT NOT NULL,
  current_quantity INT DEFAULT 0,
  deadline TIMESTAMP NOT NULL,
  status ENUM('open', 'closed', 'completed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES `users`(id)
);

CREATE TABLE IF NOT EXISTS `carts` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  group_buy_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES `users`(id),
  FOREIGN KEY (product_id) REFERENCES `products`(id),
  FOREIGN KEY (group_buy_id) REFERENCES `group_buys`(id)
);

CREATE TABLE IF NOT EXISTS `orders` (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  group_buy_id VARCHAR(36),
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES `users`(id),
  FOREIGN KEY (group_buy_id) REFERENCES `group_buys`(id)
);

CREATE TABLE IF NOT EXISTS `order_items` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES `orders`(id),
  FOREIGN KEY (product_id) REFERENCES `products`(id)
);

CREATE TABLE IF NOT EXISTS `Coupon` (
  CouponId INT AUTO_INCREMENT,
  Title VARCHAR(255) NOT NULL,
  Description TEXT,
  Brand VARCHAR(255),
  Location VARCHAR(255),
  DiscountStart TIMESTAMP NOT NULL,
  DiscountEnd TIMESTAMP NOT NULL,
  Currency VARCHAR(10),
  DiscountNum DECIMAL(10, 2) NOT NULL,
  DiscountType ENUM('percent', 'amount') NOT NULL,
  UploadDate TIMESTAMP DEFAULT NOW(),
  UploadedBy INT,
  Archived BOOLEAN DEFAULT FALSE,
  PRIMARY KEY(CouponId),
  CONSTRAINT FK_UploadedBy FOREIGN KEY (UploadedBy) REFERENCES `users`(id)
);

-- 新版 groupbuys 與 orders table，並保留原本 v1 結構
CREATE TABLE IF NOT EXISTS `groupbuys` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  status VARCHAR(32) DEFAULT '進行中',
  max_count INT NOT NULL,
  current_count INT DEFAULT 0,
  deadline DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS `orders` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  groupbuy_id INT NOT NULL,
  user_id INT NOT NULL,
  product VARCHAR(255),
  quantity INT,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (groupbuy_id) REFERENCES groupbuys(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 新增notifications表
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `reference_id` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 插入用戶（密碼需使用 bcrypt 加密）
INSERT INTO `users` (id, email, name, password, join_date) 
VALUES 
(1, 'mavis123@gmail.com', 'Mavis', 'MavisPass2024!', NOW()),
(2, 'harvey_99@yahoo.com', 'Harvey', 'HarveySecure99', NOW()),
(3, 'eric.wang@outlook.com', 'Eric', 'EricStrongPwd', NOW()),
(4, 'hsiu.wei.tw@gmail.com', 'Hsiu Wei', 'WeiSuperSafe123', NOW());
-- 生成 bcrypt 密碼
-- 執行以下 Node.js 程式碼獲取雜湊值：
-- const bcrypt = require('bcrypt');
-- bcrypt.hash('MavisPass2024!', 10, (err, hash) => console.log(hash));

-- 插入測試產品
INSERT INTO `products` (id, name, price, stock, image_url) 
VALUES 
('prod1', 'Coffee Beans', 10.00, 100, '/images/coffee.jpg'),
('prod2', 'Pizza', 15.00, 50, '/images/pizza.jpg');