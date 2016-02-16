-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Feb 07, 2016 at 10:48 PM
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
  `type` int(11) NOT NULL,
  `messageText` longtext COLLATE utf8_unicode_ci NOT NULL,
  `createdDate` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_B6BD307FF675F31B` (`author_id`),
  KEY `IDX_B6BD307F8829462F` (`message_thread_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `message_image` (
  `id` int(11) NOT NULL,  
  `thumbnail_upload_dir` varchar(255) NOT NULL,
  `thumbnail_name` varchar(255) NOT NULL,
  `full_upload_dir` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `mime` varchar(255) NOT NULL,
  PRIMARY KEY (`id`) 
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

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
  `geoPoint` point,
  `createdDate` datetime NOT NULL,
  `socketId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_8D93D649DC19589B` (`current_message_thread_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

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
