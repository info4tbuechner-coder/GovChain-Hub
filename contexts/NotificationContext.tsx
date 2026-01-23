import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserNotification } from '../types';
import { DbService } from '../services/mockDbService';

interface NotificationContextType {
  notifications: UserNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
  dispatchNotification: (title: string, message: string, type: UserNotification['type'], linkTo?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  const refreshNotifications = useCallback(async () => {
    const data = await DbService.getNotifications();
    setNotifications(data);
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const markAsRead = async (id: string) => {
    await DbService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => DbService.markNotificationRead(n.id)));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dispatchNotification = (title: string, message: string, type: UserNotification['type'], linkTo?: string) => {
      // In a real app, this would post to the backend. Here we update local state for the demo.
      const newNotif: UserNotification = {
          id: crypto.randomUUID(),
          title,
          message,
          type,
          timestamp: new Date(),
          read: false,
          linkTo
      };
      setNotifications(prev => [newNotif, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications, dispatchNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
