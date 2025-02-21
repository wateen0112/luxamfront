"use client"
// context/NotificationContext.js
import React, { createContext, useContext, useState } from 'react';
import Notification from './Notification';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const triggerNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000); // لإخفاء الرسالة بعد 5 ثواني
  };

  return (
    <NotificationContext.Provider value={triggerNotification}>
      {children}
      {notification && <Notification message={notification.message} type={notification.type} />}
    </NotificationContext.Provider>
  );
};
