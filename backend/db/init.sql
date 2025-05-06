SET NAMES 'utf8mb4'; -- set encoding
CREATE DATABASE IF NOT EXISTS `dbms-example`;
USE `dbms-example`;

CREATE TABLE IF NOT EXISTS `User` (
	UserId INT AUTO_INCREMENT,
	Email VARCHAR(255) NOT NULL,
	Name VARCHAR(255) NOT NULL,
	Password VARCHAR(255) NOT NULL,
	JoinDate TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT UC_Email UNIQUE(Email),
	PRIMARY KEY(UserId)
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
	CONSTRAINT FK_UploadedBy FOREIGN KEY (UploadedBy) REFERENCES `User`(UserId)
);

INSERT INTO `User` (UserId, Email, Name, Password, JoinDate) 
VALUES 
(1, 'mavis123@gmail.com', 'Mavis', 'MavisPass2024!', NOW()),
(2, 'harvey_99@yahoo.com', 'Harvey', 'HarveySecure99', NOW()),
(3, 'eric.wang@outlook.com', 'Eric', 'EricStrongPwd', NOW()),
(4, 'hsiu.wei.tw@gmail.com', 'Hsiu Wei', 'WeiSuperSafe123', NOW());

INSERT INTO Coupon (CouponId, Title, Description, Brand, Location, DiscountStart, DiscountEnd, Currency, DiscountNum, DiscountType, UploadDate, UploadedBy, Archived) 
VALUES 
(1, '50% Off Coffee', 'Get 50% off on any coffee purchase.', 'Starbucks', 'Vienna, Austria', '2025-03-15 08:00:00', '2025-03-31 23:59:59', 'EUR', 50.00, 'percent', NOW(), 1, FALSE),
(2, '€10 Off Electronics', 'Save €10 on purchases over €100.', 'MediaMarkt', 'Berlin, Germany', '2025-04-01 00:00:00', '2025-04-15 23:59:59', 'EUR', 10.00, 'amount', NOW(), 1, FALSE),
(3, 'Buy 1 Get 1 Free Pizza', 'Order any pizza and get another one free.', 'Domino’s', 'Paris, France', '2025-03-20 12:00:00', '2025-03-25 22:00:00', NULL, 100.00, 'percent', NOW(), 1, FALSE);
