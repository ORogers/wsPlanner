-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.2.13-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for wsplanner
CREATE DATABASE IF NOT EXISTS `wsPlanner` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `wsPlanner`;

-- Dumping structure for table wsplanner.lecturers
CREATE TABLE IF NOT EXISTS `lecturers` (
  `lID` bigint(20) NOT NULL AUTO_INCREMENT,
  `fName` varchar(30) NOT NULL,
  `lName` varchar(30) NOT NULL,
  `email` varchar(255) NOT NULL,
  PRIMARY KEY (`lID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;



-- Data exporting was unselected.
-- Dumping structure for table wsplanner.units
CREATE TABLE IF NOT EXISTS `units` (
  `uID` bigint(20) NOT NULL AUTO_INCREMENT,
  `uTitle` varchar(60) NOT NULL,
  `uShortTitle` varchar(60) NOT NULL,
  `uDesc` varchar(500) DEFAULT NULL,
  `uCoor` bigint(20) NOT NULL,
  `uWeeks` int(11) NOT NULL,
  PRIMARY KEY (`uID`),
  KEY `Units_fk0` (`uCoor`),
  CONSTRAINT `Units_fk0` FOREIGN KEY (`uCoor`) REFERENCES `lecturers` (`lID`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=latin1;


CREATE TABLE IF NOT EXISTS `topics` (
  `tID` bigint(20) NOT NULL AUTO_INCREMENT,
  `tName` varchar(60) NOT NULL,
  `tOrder` int(11) NOT NULL,
  `uID` bigint(20) NOT NULL,
  `tLeader` bigint(20) DEFAULT NULL,
  `tWeeks` int(11) NOT NULL,
  `tNotes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`tID`),
  KEY `topics_fk0` (`uID`),
  KEY `topics_fk1` (`tLeader`),
  CONSTRAINT `topics_fk0` FOREIGN KEY (`uID`) REFERENCES `units` (`uID`),
  CONSTRAINT `topics_fk1` FOREIGN KEY (`tLeader`) REFERENCES `lecturers` (`lID`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=latin1;
