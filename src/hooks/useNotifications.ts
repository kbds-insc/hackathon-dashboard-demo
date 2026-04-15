import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/useAuth';
import {
  apiFetchNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
} from '../api/notifications';
import type { Notification } from '../data/mockData';

export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [list, setList] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;
    const currentUserId = userId;
    async function load() {
      try {
        const data = await apiFetchNotifications(currentUserId);
        if (!cancelled) setList(data);
      } catch (e) {
        console.error(e);
      }
    }

    load();

    const channel = supabase
      .channel('hook-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        load();
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markRead = async (id: string) => {
    await apiMarkNotificationRead(id);
    setList((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllRead = async () => {
    if (!userId) return;
    await apiMarkAllNotificationsRead(userId);
    setList((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return { list, markRead, markAllRead };
}
