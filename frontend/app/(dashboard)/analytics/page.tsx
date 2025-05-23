'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

type Analytics = {
  totalGroupBuys: number;
  completedGroupBuys: number;
  ongoingGroupBuys: number;
  totalUsers: number;
  uniqueOrderUsers?: number; // 新增：有下單過的顧客數
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [groupbuys, setGroupbuys] = useState<any[]>([]);
  const [loadingGroupbuys, setLoadingGroupbuys] = useState(true);
  const [ordersMap, setOrdersMap] = useState<Record<number, any[]>>({});
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      try {
        const response = await fetch(`${API_URL}/api/v1/analytics`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    }
    fetchAnalytics();
  }, []);

  useEffect(() => {
    async function fetchGroupbuysAndOrders() {
      setLoadingGroupbuys(true);
      setLoadingOrders(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      // 嘗試從 window 取得 userId，若無則 fallback 1
      let userId: number = 1;
      if (typeof window !== 'undefined' && window.__CURRENT_USER_ID__) {
        userId = parseInt(window.__CURRENT_USER_ID__, 10) || 1;
      } else {
        const localId = localStorage.getItem('userId');
        if (localId) userId = parseInt(localId, 10) || 1;
      }
      const res = await fetch(`${API_URL}/api/v1/groupbuys?user_id=${userId}`);
      let groupbuysData: any[] = [];
      if (res.ok) {
        groupbuysData = await res.json();
        setGroupbuys(groupbuysData);
      }
      // 依序查詢每一團的訂單
      const ordersMapTemp: Record<number, any[]> = {};
      await Promise.all(
        groupbuysData.map(async (g) => {
          const resOrders = await fetch(`${API_URL}/api/v1/groupbuys/${g.id}/orders`);
          if (resOrders.ok) {
            const orders = await resOrders.json();
            ordersMapTemp[g.id] = orders;
          } else {
            ordersMapTemp[g.id] = [];
          }
        })
      );
      setOrdersMap(ordersMapTemp);
      setLoadingGroupbuys(false);
      setLoadingOrders(false);
    }
    fetchGroupbuysAndOrders();
  }, []);

  if (!analytics) return <div>Loading...</div>;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總團購數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalGroupBuys}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已成團數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedGroupBuys}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">進行中團購數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.ongoingGroupBuys}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">買過我商品的顧客數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueOrderUsers ?? analytics.totalUsers}</div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4">我開過的團購</h2>
        {loadingGroupbuys ? (
          <div>載入中...</div>
        ) : groupbuys.length === 0 ? (
          <div>目前沒有團購</div>
        ) : (
          <div className="overflow-x-auto">
            {groupbuys.map((g) => (
              <div key={g.id} className="mb-8 border rounded-lg p-4 bg-white">
                <div className="font-bold text-base mb-1">{g.title}</div>
                <div className="text-sm text-gray-600 mb-1">{g.description}</div>
                <div className="text-sm mb-1">狀態：{g.status}　人數：{g.current_count} / {g.max_count}</div>
                <div className="text-sm mb-1">截止日：{new Date(g.deadline).toLocaleDateString()}</div>
                <div className="text-sm mb-1">價格：${g.price}</div>
                <div className="text-sm mb-2">建立時間：{new Date(g.created_at).toLocaleString()}</div>
                <div className="font-semibold mb-2">訂單明細：</div>
                {loadingOrders ? (
                  <div>訂單載入中...</div>
                ) : (ordersMap[g.id]?.length === 0 ? (
                  <div className="text-gray-400 mb-2">目前沒有訂單</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm mb-2">
                      <thead>
                        <tr>
                          <th className="border px-2 py-1">顧客姓名</th>
                          <th className="border px-2 py-1">顧客 Email</th>
                          <th className="border px-2 py-1">商品</th>
                          <th className="border px-2 py-1">數量</th>
                          <th className="border px-2 py-1">付款狀態</th>
                          <th className="border px-2 py-1">下單時間</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordersMap[g.id].map((order) => (
                          <tr key={order.id}>
                            <td className="border px-2 py-1">{order.user_name}</td>
                            <td className="border px-2 py-1">{order.user_email}</td>
                            <td className="border px-2 py-1">{order.product}</td>
                            <td className="border px-2 py-1">{order.quantity}</td>
                            <td className="border px-2 py-1">{order.paid ? '已付款' : '未付款'}</td>
                            <td className="border px-2 py-1">{new Date(order.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
