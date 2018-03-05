CREATE TABLE `Lecturers` (
	`lID` bigint NOT NULL AUTO_INCREMENT,
	`fName` varchar(30) NOT NULL,
	`lName` varchar(30) NOT NULL,
	`email` varchar(255) NOT NULL,
	PRIMARY KEY (`lID`)
);

CREATE TABLE `Units` (
	`uID` bigint NOT NULL AUTO_INCREMENT,
	`uTitle` varchar(60) NOT NULL,
	`uShortTitle` varchar(60) NOT NULL,
	`uDesc` varchar(500),
	`uCoor` bigint NOT NULL,
	`uAuthor` bigint NOT NULL,
	PRIMARY KEY (`uID`)
);

CREATE TABLE `CoAuthors` (
	`coAutID` bigint NOT NULL AUTO_INCREMENT,
	`uID` bigint NOT NULL,
	`lID` bigint NOT NULL,
	PRIMARY KEY (`coAutID`)
);

ALTER TABLE `Units` ADD CONSTRAINT `Units_fk0` FOREIGN KEY (`uCoor`) REFERENCES `Lecturers`(`lID`);

ALTER TABLE `CoAuthors` ADD CONSTRAINT `CoAuthors_fk0` FOREIGN KEY (`uID`) REFERENCES `Units`(`uID`);

ALTER TABLE `CoAuthors` ADD CONSTRAINT `CoAuthors_fk1` FOREIGN KEY (`lID`) REFERENCES `Lecturers`(`lID`);
