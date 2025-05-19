// frontend/app/order/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type OrderItem = {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  group_buy_id?: string;
};

type GroupBuy = {
  groupId: string;
  owner: string;
};

type Order = {
  id: string;
  total: number;
  items: OrderItem[];
  groupBuys: GroupBuy[];
};

export default function OrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    const orderData = orderHistory.find((order: any) => order.id === id);
    if (orderData) {
      setOrder({
        id: orderData.id,
        total: orderData.total,
        items: orderData.items.map((item: any) => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.unitPrice,
          group_buy_id: item.group_buy_id,
        })),
        groupBuys: orderData.groupBuys,
      });
    }
    setLoading(false);
  }, [id]);

  if (loading) return <div className="p-6">載入中...</div>;
  if (!order) return <div className="p-6">訂單不存在</div>;

  const groupItemsByOwner = () => {
    const grouped: { [owner: string]: { groupBuy: GroupBuy | null; items: OrderItem[] } } = {};
    order.groupBuys.forEach((groupBuy) => {
      grouped[groupBuy.owner] = {
        groupBuy,
        items: order.items.filter((item) => item.group_buy_id === groupBuy.groupId),
      };
    });
    grouped['無團購'] = {
      groupBuy: null,
      items: order.items.filter((item) => !item.group_buy_id),
    };
    return grouped;
  };

  const groupedItems = groupItemsByOwner();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">訂單 #{order.id}</h1>
      {Object.entries(groupedItems).map(([owner, { groupBuy, items }]) => (
        <Card key={owner} className="mb-6">
          <CardHeader>
            <CardTitle>{owner} 的團購</CardTitle>
          </CardHeader>
          <CardContent>
            {groupBuy && (
              <div className="mb-4 p-4 border rounded bg-gray-50">
                <p>團購 ID: {groupBuy.groupId}</p>
                <p>團主: {groupBuy.owner}</p>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品名稱</TableHead>
                  <TableHead>數量</TableHead>
                  <TableHead>單價</TableHead>
                  <TableHead>總價</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={`${item.product_id}-${item.group_buy_id || 'no-group'}`}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>${(item.quantity * item.price).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardContent className="pt-6">
          <p className="font-bold">訂單總計: ${order.total.toFixed(2)}</p>
        </CardContent>
      </Card>
    </div>
  );
}