import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Notification, deleteNotification, getNotifications } from '@/lib/notifications';
import { Bell, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NotificationsProps {
  userId: number;
  token: string;
}

export function Notifications({ userId, token }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // 定期獲取通知
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications(userId, token);
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    // 每 30 秒更新一次通知
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId, token]);

  const handleDelete = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId, token);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-50 p-4 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">通知</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">沒有新通知</p>
          ) : (
            <ul className="space-y-3">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <p className="text-sm flex-1">{notification.content}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 shrink-0"
                    onClick={() => handleDelete(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
