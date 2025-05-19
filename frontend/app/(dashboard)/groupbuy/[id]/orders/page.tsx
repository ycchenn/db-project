"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Order {
  id: number;
  product: string;
  quantity: number;
  paid: boolean;
  created_at: string;
  user_id: number;
  user_name: string;
  user_email: string;
}

interface GroupbuyInfo {
  id: number;
  title: string;
  description: string;
  price: number;
  status: string;
  current_count: number;
  max_count: number;
  deadline: string;
  image_url?: string;
}

export default function GroupbuyOrdersPage() {
  const params = useParams();
  const groupbuyId = params.id;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupbuy, setGroupbuy] = useState<GroupbuyInfo | null>(null);
  const [loadingGroupbuy, setLoadingGroupbuy] = useState(true);

  useEffect(() => {
    async function fetchGroupbuyAndOrders() {
      setLoadingGroupbuy(true);
      setLoading(true);
      const resGroupbuy = await fetch(`http://localhost:3000/api/v1/groupbuys/${groupbuyId}`);
      const resOrders = await fetch(`http://localhost:3000/api/v1/groupbuys/${groupbuyId}/orders`);
      if (resGroupbuy.ok) {
        const data = await resGroupbuy.json();
        setGroupbuy(data);
      }
      if (resOrders.ok) {
        const data = await resOrders.json();
        setOrders(data);
      }
      setLoadingGroupbuy(false);
      setLoading(false);
    }
    if (groupbuyId) fetchGroupbuyAndOrders();
  }, [groupbuyId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>團購訂單明細</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 團購資訊區塊 */}
        {loadingGroupbuy ? (
          <div>載入團購資訊中...</div>
        ) : groupbuy ? (
          <div className="mb-6 p-4 border rounded bg-gray-50">
            <div className="font-bold text-lg mb-1">{groupbuy.title}</div>
            <div className="text-sm text-gray-600 mb-1">{groupbuy.description}</div>
            <div className="text-sm mb-1">狀態：{groupbuy.status}　人數：{groupbuy.current_count} / {groupbuy.max_count}</div>
            <div className="text-sm mb-1">截止日：{new Date(groupbuy.deadline).toLocaleDateString()}</div>
            <div className="text-sm mb-1">價格：${groupbuy.price}</div>
          </div>
        ) : null}
        {/* 訂單表格區塊 */}
        {loading ? (
          <div>載入中...</div>
        ) : orders.length === 0 ? (
          <div>目前沒有訂單</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>顧客姓名</TableHead>
                <TableHead>顧客 Email</TableHead>
                <TableHead>商品</TableHead>
                <TableHead>數量</TableHead>
                <TableHead>付款狀態</TableHead>
                <TableHead>下單時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.user_name}</TableCell>
                  <TableCell>{order.user_email}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{order.paid ? "已付款" : "未付款"}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
