"use client";
// components/Notification.js
import React from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";

const Notification = ({ message, type }) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500" />;
      case "error":
        return <FaExclamationCircle className="text-red-500" />;
      case "warning":
        return <FaInfoCircle className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const backgroundColor =
    type === "success"
      ? "bg-green-100"
      : type === "error"
      ? "bg-red-100"
      : "bg-yellow-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-8 left-1/2 transform -translate-x-1/2 p-4 w-auto rounded-lg shadow-lg ${backgroundColor} flex items-center space-x-3 z-50`}
    >
      <div className="text-2xl">{getIcon()}</div>
      <div className="whitespace-nowrap text-gray-800">{message}</div>
    </motion.div>
  );
};

export default Notification;
