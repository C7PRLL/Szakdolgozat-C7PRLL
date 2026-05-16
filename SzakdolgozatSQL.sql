-- --------------------------------------------------------
-- Gazdagép:                     127.0.0.1
-- Szerver verzió:               12.3.1-MariaDB - MariaDB Server
-- Szerver OS:                   Win64
-- HeidiSQL Verzió:              12.16.0.7229
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Adatbázis struktúra mentése a f1academy.
CREATE DATABASE IF NOT EXISTS `f1academy` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `f1academy`;

-- Struktúra mentése tábla f1academy. bookings
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `activity_type` varchar(255) NOT NULL,
  `booking_date` date NOT NULL,
  `time_slot` varchar(255) NOT NULL,
  `participant_count` int(11) NOT NULL DEFAULT 1,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `note` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Az adatok exportálása nem lett kiválasztva.

-- Struktúra mentése tábla f1academy. constructor_standings
CREATE TABLE IF NOT EXISTS `constructor_standings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `season_year` int(11) NOT NULL,
  `round` int(11) NOT NULL DEFAULT 0,
  `constructor_id` int(11) NOT NULL,
  `position` int(11) NOT NULL,
  `points` float NOT NULL DEFAULT 0,
  `wins` int(11) NOT NULL DEFAULT 0,
  `fetched_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `constructor_id` (`constructor_id`),
  CONSTRAINT `1` FOREIGN KEY (`constructor_id`) REFERENCES `constructors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Az adatok exportálása nem lett kiválasztva.

-- Struktúra mentése tábla f1academy. constructors
CREATE TABLE IF NOT EXISTS `constructors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `external_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `wiki_url` varchar(1000) DEFAULT NULL,
  `last_synced_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `external_id` (`external_id`),
  UNIQUE KEY `external_id_2` (`external_id`),
  UNIQUE KEY `external_id_3` (`external_id`),
  UNIQUE KEY `external_id_4` (`external_id`),
  UNIQUE KEY `external_id_5` (`external_id`),
  UNIQUE KEY `external_id_6` (`external_id`),
  UNIQUE KEY `external_id_7` (`external_id`),
  UNIQUE KEY `external_id_8` (`external_id`),
  UNIQUE KEY `external_id_9` (`external_id`),
  UNIQUE KEY `external_id_10` (`external_id`),
  UNIQUE KEY `external_id_11` (`external_id`),
  UNIQUE KEY `external_id_12` (`external_id`),
  UNIQUE KEY `external_id_13` (`external_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Az adatok exportálása nem lett kiválasztva.

-- Struktúra mentése tábla f1academy. customer_profiles
CREATE TABLE IF NOT EXISTS `customer_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(255) DEFAULT NULL,
  `weight_kg` int(11) DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `preferred_language` varchar(255) DEFAULT 'hu',
  `marketing_consent` tinyint(1) NOT NULL DEFAULT 0,
  `liability_accepted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Az adatok exportálása nem lett kiválasztva.

-- Struktúra mentése tábla f1academy. driver_season_points
CREATE TABLE IF NOT EXISTS `driver_season_points` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `season_year` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `position` int(11) DEFAULT NULL,
  `points` float NOT NULL DEFAULT 0,
  `wins` int(11) NOT NULL DEFAULT 0,
  `fetched_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `driver_season_points_season_year_driver_id` (`season_year`,`driver_id`),
  KEY `driver_id` (`driver_id`),
  CONSTRAINT `1` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Az adatok exportálása nem lett kiválasztva.

-- Struktúra mentése tábla f1academy. driver_standings
CREATE TABLE IF NOT EXISTS `driver_standings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `season_year` int(11) NOT NULL,
  `round` int(11) NOT NULL DEFAULT 0,
  `driver_id` int(11) NOT NULL,
  `constructor_id` int(11) DEFAULT NULL,
  `position` int(11) NOT NULL,
  `points` float NOT NULL DEFAULT 0,
  `wins` int(11) NOT NULL DEFAULT 0,
  `fetched_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `driver_id` (`driver_id`),
  KEY `constructor_id` (`constructor_id`),
  CONSTRAINT `25` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `26` FOREIGN KEY (`constructor_id`) REFERENCES `constructors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Az adatok exportálása nem lett kiválasztva.

-- Struktúra mentése tábla f1academy. drivers
CREATE TABLE IF NOT EXISTS `drivers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `external_id` varchar(255) NOT NULL,
  `given_name` varchar(255) NOT NULL,
  `family_name` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `permanent_number` varchar(255) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `wiki_url` varchar(1000) DEFAULT NULL,
  `headshot_url` varchar(1000) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `first_season` int(11) DEFAULT NULL,
  `last_season` int(11) DEFAULT NULL,
  `last_synced_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `external_id` (`external_id`),
  UNIQUE KEY `external_id_2` (`external_id`),
  UNIQUE KEY `external_id_3` (`external_id`),
  UNIQUE KEY `external_id_4` (`external_id`),
  UNIQUE KEY `external_id_5` (`external_id`),
  UNIQUE KEY `external_id_6` (`external_id`),
  UNIQUE KEY `external_id_7` (`external_id`),
  UNIQUE KEY `external_id_8` (`external_id`),
  UNIQUE KEY `external_id_9` (`external_id`),
  UNIQUE KEY `external_id_10` (`external_id`),
  UNIQUE KEY `external_id_11` (`external_id`),
  UNIQUE KEY `external_id_12` (`external_id`),
  UNIQUE KEY `external_id_13` (`external_id`)
) ENGINE=InnoDB AUTO_INCREMENT=880 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Az adatok exportálása nem lett kiválasztva.

-- Struktúra mentése tábla f1academy. news_articles
CREATE TABLE IF NOT EXISTS `news_articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source_name` varchar(255) DEFAULT NULL,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `url` varchar(1000) NOT NULL,
  `image_url` varchar(1000) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `content_snippet` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_synced_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `url` (`url`) USING HASH,
  UNIQUE KEY `url_2` (`url`) USING HASH,
  UNIQUE KEY `url_3` (`url`) USING HASH,
  UNIQUE KEY `url_4` (`url`) USING HASH,
  UNIQUE KEY `url_5` (`url`) USING HASH,
  UNIQUE KEY `url_6` (`url`) USING HASH,
  UNIQUE KEY `url_7` (`url`) USING HASH,
  UNIQUE KEY `url_8` (`url`) USING HASH,
  UNIQUE KEY `url_9` (`url`) USING HASH,
  UNIQUE KEY `url_10` (`url`) USING HASH,
  UNIQUE KEY `url_11` (`url`) USING HASH,
  UNIQUE KEY `url_12` (`url`) USING HASH,
  UNIQUE KEY `url_13` (`url`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Az adatok exportálása nem lett kiválasztva.

-- Struktúra mentése tábla f1academy. users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verification_token` varchar(128) DEFAULT NULL,
  `verification_expires_at` datetime DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `password_reset_token` varchar(128) DEFAULT NULL,
  `password_reset_expires_at` datetime DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `favorite_team` varchar(255) DEFAULT NULL,
  `favorite_pilot` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `facebook_id` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Az adatok exportálása nem lett kiválasztva.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
