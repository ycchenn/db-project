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

type Order = {
  id: number;
  product: string;
  quantity: number;
  paid: boolean;
  created_at: string;
};

async function getCustomers(offset: number) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
  const userId = localStorage.getItem('userId');
  
  // 檢查登入狀態
  if (!userId) {
    alert('請先登入');
    throw new Error('未登入');
  }

  const response = await fetch(
    `${API_URL}/api/v1/orders?user_id=${userId}&offset=${offset}&limit=5`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    }
  );

  if (!response.ok) {
    throw new Error('無法取得訂單資訊');
  }

  return response.json();
}

export default function CustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);

  useEffect(() => {
    // 初次載入資料
    getCustomers(0).then((data) => {
      setOrders(data.orders);
      setTotalOrders(data.totalOrders);
      setCurrentOffset(data.orders.length);
    });
  }, []);

  // 載入更多資料
  const loadMore = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const data = await getCustomers(currentOffset);
      setOrders(prev => [...prev, ...data.orders]);
      setCurrentOffset(prev => prev + data.orders.length);
    } catch (error) {
      console.error('載入更多資料失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>我的訂購紀錄</CardTitle>
        <CardDescription>查看所有訂購紀錄與狀態。</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>產品</TableHead>
              <TableHead>數量</TableHead>
              <TableHead>付款狀態</TableHead>
              <TableHead>訂購日期</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.product}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>{order.paid ? '已付款' : '未付款'}</TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString('zh-TW')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-col items-center w-full pt-4 gap-4">
          <div className="text-xs text-muted-foreground">
            顯示 <strong>{orders.length}</strong> 筆，共 <strong>{totalOrders}</strong> 筆訂單
          </div>
          {orders.length < totalOrders && (
            <Button
              onClick={loadMore}
              variant="outline"
              size="sm"
              type="button"
              disabled={isLoading}
              className="w-full max-w-[200px]"
            >
              {isLoading ? '載入中...' : '載入更多'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}