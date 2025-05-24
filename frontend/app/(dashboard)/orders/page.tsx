// frontend/app/(dashboard)/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, ShoppingCart } from 'lucide-react';

type CartItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  group_buy_id?: string;
};

type GroupBuy = {
  groupId: string;
  owner: string;
  targetQuantity: number;
  currentQuantity: number;
  deadline: string;
  status: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ items: CartItem[]; groupBuys: GroupBuy[] }>({ items: [], groupBuys: [] });
  const [total, setTotal] = useState(0);
  const [countdownMap, setCountdownMap] = useState<{ [groupId: string]: string }>({});
  const [isLockedMap, setIsLockedMap] = useState<{ [groupId: string]: boolean }>({});
  const [notification, setNotification] = useState<string | null>(null);

  // 初始化：從 localStorage 載入購物車
  useEffect(() => {
    const loadCart = () => {
      const storedCart = JSON.parse(localStorage.getItem('cart') || '{"items":[],"groupBuys":[]}');
      // 確保 items 和 groupBuys 是陣列
      const normalizedCart = {
        items: Array.isArray(storedCart.items) ? storedCart.items.map((item: any) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })) : [],
        groupBuys: Array.isArray(storedCart.groupBuys) ? storedCart.groupBuys : [],
      };
      setCart(normalizedCart);
    };
    loadCart();
  }, []);

  // 倒數計時：為每個團購計算
  /*useEffect(() => {
    const updateCountdowns = () => {
      const newCountdownMap: { [groupId: string]: string } = {};
      const newIsLockedMap: { [groupId: string]: boolean } = {};
      (cart.groupBuys || []).forEach((groupBuy) => {
        const deadline = new Date(groupBuy.deadline);
        const isLocked = deadline < new Date();
        newIsLockedMap[groupBuy.groupId] = isLocked;
        newCountdownMap[groupBuy.groupId] = isLocked
          ? '已過期'
          : (() => {
              const now = new Date();
              const diff = deadline.getTime() - now.getTime();
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((diff % (1000 * 60)) / 1000);
              return `${hours}h ${minutes}m ${seconds}s`;
            })();
      });
      setCountdownMap(newCountdownMap);
      setIsLockedMap(newIsLockedMap);
    };
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [cart.groupBuys]);*/

  // 計算總金額
  useEffect(() => {
    const total = cart.items.reduce((sum, item: CartItem) => {
      const totalPrice = Number(item.totalPrice);
      return sum + (isNaN(totalPrice) ? 0 : totalPrice);
    }, 0);
    setTotal(total);
  }, [cart.items]);

  // 自動隱藏通知欄
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 按團主分組商品
  const groupItemsByOwner = () => {
    const grouped: { [owner: string]: { groupBuy: GroupBuy | null; items: CartItem[] } } = {};
    // 防護：確保 groupBuys 是陣列
    (cart.groupBuys || []).forEach((groupBuy) => {
      grouped[groupBuy.owner] = {
        groupBuy,
        items: cart.items.filter((item) => item.group_buy_id === groupBuy.groupId),
      };
    });
    grouped['無團購'] = {
      groupBuy: null,
      items: cart.items.filter((item) => !item.group_buy_id),
    };
    return grouped;
  };

  // 修改數量
  const updateQuantity = (productId: string, groupBuyId: string | undefined, quantity: number) => {
    if (groupBuyId && isLockedMap[groupBuyId]) {
      alert('團購已過期，無法修改');
      return;
    }
    if (quantity < 1) return;
    const updatedItems = cart.items.map((item: CartItem) =>
      item.id === productId && item.group_buy_id === groupBuyId
        ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
        : item
    );
    const updatedCart = { ...cart, items: updatedItems };
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  // 移除商品
  const removeItem = (productId: string, groupBuyId: string | undefined) => {
    if (groupBuyId && isLockedMap[groupBuyId]) {
      alert('團購已過期，無法修改');
      return;
    }
    const updatedCart = {
      ...cart,
      items: cart.items.filter(
        (item) => !(item.id === productId && item.group_buy_id === groupBuyId)
      ),
    };
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  // 清空購物車
  const clearCart = () => {
    if (cart.groupBuys.some((gb) => isLockedMap[gb.groupId] === true)) {
      alert('包含已過期的團購，無法清空');
      return;
    }
    if (!confirm('確定要清空購物車嗎？')) return;
    const emptyCart = { items: [], groupBuys: [] };
    localStorage.setItem('cart', JSON.stringify(emptyCart));
    setCart(emptyCart);
  };
  

  // 結帳
  const checkout = () => {
    if (cart.groupBuys.some((gb) => isLockedMap[gb.groupId] === true)) {
      alert('包含已過期的團購，無法結帳');
      return;
    }
    if (cart.items.length === 0) {
      alert('購物車為空，無法結帳');
      return;
    }
    const uniqueOwners = new Set(cart.groupBuys.map((gb) => gb.owner)).size;
    setNotification(`結帳成功！總金額：$${total.toFixed(2)}`);
  
    // 儲存訂單資料到 localStorage（可選，作為訂單歷史記錄）
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const orderData = {
      id: orderId,
      total,
      items: cart.items,
      groupBuys: cart.groupBuys,
      createdAt: new Date().toISOString(),
    };
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    orderHistory.push(orderData);
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
  
    // 清空購物車
    const emptyCart = { items: [], groupBuys: [] };
    localStorage.setItem('cart', JSON.stringify(emptyCart));
    setCart(emptyCart);
  };

  const groupedItems = groupItemsByOwner();

  return (
    <div className="p-6">
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          {notification}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-6">我的購物車</h1>
      {Object.entries(groupedItems).map(([owner, { groupBuy, items }]) => (
        <Card key={owner} className="mb-6">
          <CardHeader>
            <CardTitle>
              
              {groupBuy && (
                <Badge
                  variant={isLockedMap[groupBuy.groupId] ? 'destructive' : 'default'}
                  className="ml-2"
                >
                  {isLockedMap[groupBuy.groupId] ? '已鎖定' : groupBuy.status}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            
            <Table>
              <TableHeader>
              <TableRow>
                  <TableHead>商品名稱</TableHead>
                  <TableHead>數量</TableHead>
                  <TableHead>單價</TableHead>
                  <TableHead>總價</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      {owner === '無團購' ? '無團購商品' : '此團購無商品'}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={`${item.id}-${item.group_buy_id || 'no-group'}`}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item.id, item.group_buy_id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1 || !!isLockedMap[item.group_buy_id ?? '']}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.id,
                                item.group_buy_id,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-16 text-center"
                            disabled={!!isLockedMap[item.group_buy_id ?? '']}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item.id, item.group_buy_id, item.quantity + 1)
                            }
                            disabled={!!isLockedMap[item.group_buy_id ?? '']}
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        ${isNaN(item.unitPrice) ? '無效價格' : Number(item.unitPrice).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        ${isNaN(item.totalPrice) ? '無效價格' : Number(item.totalPrice).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem(item.id, item.group_buy_id)}
                          disabled={!!isLockedMap[item.group_buy_id ?? '']}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between mb-4">
            <Button
              variant="destructive"
              onClick={clearCart}
              disabled={cart.items.length === 0 || cart.groupBuys.some((gb) => isLockedMap[gb.groupId] === true)}
            >
              清空購物車
            </Button>
            
          </div>
          <div className="border-t pt-4">
            <p className="font-bold">總計: ${total.toFixed(2)}</p>
            <Button
              className="w-full mt-2"
              onClick={checkout}
              disabled={cart.items.length === 0 || cart.groupBuys.some((gb) => isLockedMap[gb.groupId] === true)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> 結帳
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}