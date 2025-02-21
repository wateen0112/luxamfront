'use client'
// components/ConfirmationDialog.js
import React from 'react';
import { motion } from 'framer-motion';

const ConfirmationDialog = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50"
    >
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-xl font-semibold text-center mb-4">{message}</h2>
        <div className="flex justify-around">
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-400"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="bg-[#de8945] text-white py-2 px-4 rounded hover:bg-[#c77c3f]"
          >
            تأكيد
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationDialog;
