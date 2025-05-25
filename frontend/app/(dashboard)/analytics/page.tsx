'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

type Analytics = {
  totalGroupBuys: number;
  completedGroupBuys: number;
  ongoingGroupBuys: number;
  totalUsers: number;
  uniqueOrderUsers?: number; // 新增：有下單過的顧客數
  topProducts?: { product: string; totalSold: number }[]; // 新增：熱門商品排行
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [groupbuys, setGroupbuys] = useState<any[]>([]);
  const [loadingGroupbuys, setLoadingGroupbuys] = useState(true);
  const [ordersMap, setOrdersMap] = useState<Record<number, any[]>>({});
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      // 嘗試從 window 取得 userId，若無則 fallback 1
      let userId: number = 1;
      if (typeof window !== 'undefined' && window.__CURRENT_USER_ID__) {
        userId = parseInt(window.__CURRENT_USER_ID__, 10) || 1;
      } else {
        const localId = localStorage.getItem('userId');
        if (localId) userId = parseInt(localId, 10) || 1;
      }
      try {
        const response = await fetch(`${API_URL}/api/v1/analytics?user_id=${userId}`);
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
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

  const togglePaidStatus = async (groupbuyId: number, orderId: number, currentPaid: boolean) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    try {
      const res = await fetch(`${API_URL}/api/v1/orders/${orderId}/pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid: !currentPaid }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '更改付款狀態失敗');
      }
      // 更新前端 ordersMap 狀態
      setOrdersMap((prev) => ({
        ...prev,
        [groupbuyId]: prev[groupbuyId].map((order) =>
          order.id === orderId ? { ...order, paid: !currentPaid } : order
        ),
      }));
    } catch (error) {
      console.error('更改付款狀態失敗:', error);
      if (error instanceof Error) {
        alert(`更改付款狀態失敗: ${error.message}`);
      } else {
        alert('更改付款狀態失敗: 未知錯誤');
      }
    }
  }

  if (!analytics) return <div>Loading...</div>;

  // 熱門商品排行
  const topProducts = analytics.topProducts || [];

  // 計算每個我開過的團購的總下單量（所有商品數量加總），並依總下單量排序
  const groupbuyOrderStats = groupbuys.map((g: any) => {
    const orders = ordersMap[g.id] || [];
    const totalQuantity = orders.reduce((sum: number, order: any) => sum + (order.quantity || 0), 0);
    return {
      id: g.id,
      title: g.title,
      totalQuantity,
    };
  }).sort((a, b) => b.totalQuantity - a.totalQuantity);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">我ㄉ團</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupbuys.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">我ㄉ顧客</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueOrderUsers ?? analytics.totalUsers}</div>
          </CardContent>
        </Card>
      </div>
      {/* 熱門商品排行區塊移除，直接顯示我的熱門團購排行 */}
      <div className="mt-8 mb-8">
        <h2 className="text-lg font-bold mb-4">我的熱門團購排行</h2>
        {groupbuyOrderStats.length === 0 ? (
          <div className="text-gray-400 mb-2">目前沒有團購</div>
        ) : (
          <div className="relative flex justify-center items-end gap-4" style={{ minHeight: 160 }}>
            {/* 數線背景 */}
            <div className="absolute left-0 right-0 bottom-0 h-full flex flex-col justify-end z-0 pointer-events-none">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border-t border-dashed border-gray-300" style={{ height: 32 }} />
              ))}
            </div>
            {/* 頒獎台動態高度 */}
            {(() => {
              const top3 = groupbuyOrderStats.slice(0, 3);
              // 依照頒獎台順序：第二名、第一名、第三名
              const podiumOrder = [1, 0, 2];
              // 取最大數量，避免除以 0
              const maxQuantity = Math.max(...top3.map(g => g.totalQuantity), 1);
              // 設定最大/最小高度
              const MAX_HEIGHT = 120;
              const MIN_HEIGHT = 40;
              const podium = [
                { medal: '🥈', color: 'bg-gray-200', label: '第二名' },
                { medal: '🥇', color: 'bg-yellow-200', label: '第一名' },
                { medal: '🥉', color: 'bg-orange-200', label: '第三名' },
              ];
              return podium.map((p, idx) => {
                const realIdx = podiumOrder[idx];
                const data = top3[realIdx] || { title: '', totalQuantity: 0 };
                // 動態高度
                const height = data.totalQuantity > 0
                  ? Math.round((data.totalQuantity / maxQuantity) * (MAX_HEIGHT - MIN_HEIGHT) + MIN_HEIGHT)
                  : MIN_HEIGHT;
                return (
                  <div key={p.label} className="flex flex-col items-center justify-end z-10" style={{ minWidth: 100 }}>
                    <div className={`rounded-t-md w-full flex flex-col items-center justify-end ${p.color}`} style={{ height }}>
                      <span className="text-3xl mb-1">{p.medal}</span>
                      <span className="font-semibold text-base text-center break-words">{data.title}</span>
                      <span className="text-gray-600 text-sm">{data.totalQuantity} 件</span>
                    </div>
                    <span className="mt-2 text-xs text-gray-500">{p.label}</span>
                  </div>
                );
              });
            })()}
          </div>
        )}
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
                            <td className="border px-2 py-1">
                              <Button
                                size="sm"
                                variant={order.paid ? 'outline' : 'default'}
                                onClick={() => togglePaidStatus(g.id, order.id, order.paid)}
                              >
                                {order.paid ? '設為未付款' : '設為已付款'}
                              </Button>
                            </td>
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
