"use client";
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEffect, useState } from 'react';

type OrderDetail = {
  id: number;
  groupbuy_id: number;
  user_id: number;
  product: string;
  quantity: number;
  paid: number;
  created_at: number;
  comment?: string;
};

async function getUserOrders() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // 修正為正確的後端執行埠
  const userId = localStorage.getItem('userId');

  if (!userId) {
    alert('用戶 ID 無效，請重新登入'); // 提示用戶重新登入
    localStorage.clear(); // 清除無效的認證資料
    throw new Error('請先登入');
  }

  const response = await fetch(
    `${API_URL}/api/v1/user/orders?userId=${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  if (!response.ok) {
    if (response.status === 401) {
      // 清除無效的認證資料
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('請先登入');
    }
    const errorData = await response.json();
    throw new Error(errorData.message || '無法載入訂單資料');
  }

  return response.json();
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const data = await getUserOrders();
        setOrders(data.orders);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        if (err instanceof Error && err.message === '請先登入') {
          window.location.href = '/login';
          return;
        }
        setError(err instanceof Error ? err.message : '無法載入訂單資料');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>我的訂單記錄</CardTitle>
        <CardDescription>查看已完成結帳的訂單資訊</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>商品名稱</TableHead>
              <TableHead>數量</TableHead>
              <TableHead>單價</TableHead>
              <TableHead>總價</TableHead>
              <TableHead>購買日期</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  載入中...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  尚無訂單紀錄
                </TableCell>
              </TableRow>
            ) : (              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>${order.paid}</TableCell>
                  <TableCell>${(order.paid * order.quantity).toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(order.created_at * 1000).toLocaleDateString('zh-TW')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}