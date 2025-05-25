const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Notification {
  id: number;
  content: string;
  reference_id: string;
  created_at: string;
}

export async function getNotifications(userId: number, token: string): Promise<Notification[]> {
  const response = await fetch(`${API_URL}/api/v1/notifications/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  return response.json();
}

export async function deleteNotification(notificationId: number, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }
}
