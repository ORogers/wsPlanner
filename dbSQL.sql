
CREATE DATABASE IF NOT EXISTS `wsPlanner`;
USE `wsPlanner`;

CREATE TABLE IF NOT EXISTS `lecturers` (
  `lID` bigint(20) NOT NULL AUTO_INCREMENT,
  `fName` varchar(30) NOT NULL,
  `lName` varchar(30) NOT NULL,
  `email` varchar(255) NOT NULL,
  PRIMARY KEY (`lID`)
);

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
);

CREATE TABLE IF NOT EXISTS `topics` (
  `tID` bigint(20) NOT NULL AUTO_INCREMENT,
  `tName` varchar(60) NOT NULL,
  `tOrder` int(11) NOT NULL,
  `uID` bigint(20) NOT NULL,
  `tLeader` bigint(20) DEFAULT NULL,
  `tWeeks` int(11) NOT NULL,
  `tNotes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`tID`),
  KEY `Topics_fk0` (`uID`),
  KEY `Topics_fk1` (`tLeader`),
  CONSTRAINT `Topics_fk0` FOREIGN KEY (`uID`) REFERENCES `units` (`uID`),
  CONSTRAINT `Topics_fk1` FOREIGN KEY (`tLeader`) REFERENCES `lecturers` (`lID`)
);

CREATE TABLE IF NOT EXISTS `coAuthors` (
  `coAutID` bigint(20) NOT NULL AUTO_INCREMENT,
  `uID` bigint(20) NOT NULL,
  `lID` bigint(20) NOT NULL,
  PRIMARY KEY (`coAutID`),
  KEY `CoAuthors_fk0` (`uID`),
  KEY `CoAuthors_fk1` (`lID`),
  CONSTRAINT `CoAuthors_fk0` FOREIGN KEY (`uID`) REFERENCES `units` (`uID`),
  CONSTRAINT `CoAuthors_fk1` FOREIGN KEY (`lID`) REFERENCES `lecturers` (`lID`)
);
