-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Feb 08, 2016 at 07:39 PM
-- Server version: 5.6.17
-- PHP Version: 5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `nameless`
--

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE IF NOT EXISTS `message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `author_id` int(11) DEFAULT NULL,
  `message_thread_id` int(11) DEFAULT NULL,
  `messageText` longtext COLLATE utf8_unicode_ci NOT NULL,
  `createdDate` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_B6BD307FF675F31B` (`author_id`),
  KEY `IDX_B6BD307F8829462F` (`message_thread_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `message_thread`
--

CREATE TABLE IF NOT EXISTS `message_thread` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `updatedDate` datetime NOT NULL,
  `createdDate` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=8 ;

--
-- Dumping data for table `message_thread`
--

INSERT INTO `message_thread` (`id`, `updatedDate`, `createdDate`) VALUES
(1, '2016-02-08 18:24:04', '2016-02-08 18:24:04'),
(2, '2016-02-08 18:26:27', '2016-02-08 18:26:27'),
(3, '2016-02-08 18:28:59', '2016-02-08 18:28:59'),
(4, '2016-02-08 18:29:55', '2016-02-08 18:29:55'),
(5, '2016-02-08 19:33:58', '2016-02-08 19:33:58'),
(6, '2016-02-08 19:34:57', '2016-02-08 19:34:57'),
(7, '2016-02-08 19:35:39', '2016-02-08 19:35:39');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `current_message_thread_id` int(11) DEFAULT NULL,
  `username` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `state` int(11) NOT NULL,
  `searchRange` int(11) NOT NULL,
  `geoPoint` point DEFAULT NULL,
  `createdDate` datetime NOT NULL,
  `socketId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_8D93D649DC19589B` (`current_message_thread_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=13 ;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `current_message_thread_id`, `username`, `state`, `searchRange`, `geoPoint`, `createdDate`, `socketId`) VALUES
(5, 5, 'Paris', 111, 10, POINT(48.8574952, 2.351191), '0000-00-00 00:00:00', 'socketId'),
(6, 3, 'Russie', 111, 10, POINT(55.758067, 37.617295), '0000-00-00 00:00:00', 'socketId'),
(7, 7, 'Chine', 111, 10, POINT(39.9097567, 116.4112178), '0000-00-00 00:00:00', 'socketId'),
(8, 4, 'Londre', 111, 10, POINT(51.5086961, -0.1259444), '0000-00-00 00:00:00', 'socketId'),
(9, 6, 'Tours', 111, 10, POINT(47.399711, 0.6877799), '0000-00-00 00:00:00', 'socketId'),
(10, 5, 'IUT', 111, 10, POINT(44.8301288, -0.5622375), '0000-00-00 00:00:00', 'socketId'),
(11, 6, 'Olivier', 111, 10, POINT(44.8232844, -0.5792889), '0000-00-00 00:00:00', 'socketId'),
(12, 7, 'Alex', 111, 10, POINT(44.7946515, -0.6130784), '0000-00-00 00:00:00', 'socketId');

-- --------------------------------------------------------

--
-- Table structure for table `user_message_thread`
--

CREATE TABLE IF NOT EXISTS `user_message_thread` (
  `user_id` int(11) NOT NULL,
  `message_thread_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`message_thread_id`),
  KEY `IDX_6D820ED5A76ED395` (`user_id`),
  KEY `IDX_6D820ED58829462F` (`message_thread_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `user_message_thread`
--

INSERT INTO `user_message_thread` (`user_id`, `message_thread_id`) VALUES
(5, 3),
(5, 5),
(6, 3),
(7, 4),
(7, 7),
(8, 4),
(9, 6),
(10, 5),
(11, 6),
(12, 7);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `FK_B6BD307F8829462F` FOREIGN KEY (`message_thread_id`) REFERENCES `message_thread` (`id`),
  ADD CONSTRAINT `FK_B6BD307FF675F31B` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `FK_8D93D649DC19589B` FOREIGN KEY (`current_message_thread_id`) REFERENCES `message_thread` (`id`);

--
-- Constraints for table `user_message_thread`
--
ALTER TABLE `user_message_thread`
  ADD CONSTRAINT `FK_6D820ED58829462F` FOREIGN KEY (`message_thread_id`) REFERENCES `message_thread` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_6D820ED5A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
