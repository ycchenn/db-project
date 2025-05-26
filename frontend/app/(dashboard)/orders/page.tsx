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
  groupbuy_id?: string;
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
  const [notification, setNotification] = useState<string | null>(null);

  // 初始化：從 localStorage 載入購物車
  useEffect(() => {
    const loadCartFromDB = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return;
      
      console.log('🔥 user:', user);
      const res = await fetch(`http://localhost:3000/api/cart/${user.id}`);
      const data = await res.json();
      setCart({
        items: data.items || [],
        groupBuys: data.groupBuy ? [data.groupBuy] : [],
      });
    };
    loadCartFromDB();
  }, []);

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

  const loadCartFromDB = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;
  
    const res = await fetch(`http://localhost:3000/api/cart/${user.id}`);
    const data = await res.json();
    setCart({
      items: data.items || [],
      groupBuys: data.groupBuys || [],
    });
  };

  // 修改數量
  const updateQuantity = async (productId: string, groupBuyId: string | undefined, quantity: number) => {
    console.log('🧪 呼叫 updateQuantity:', { productId, groupBuyId, quantity });
    if (quantity < 1) return;
  
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;
  
    try {
      await fetch('http://localhost:3000/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productId,
          quantity
        }),
      });
      
      // 更新本地購物車數據
      const updatedItems = cart.items.map(item => {
        if (item.id === productId) {
          return {
            ...item,
            quantity: quantity,
            totalPrice: Number(item.unitPrice) * quantity
          };
        }
        return item;
      });
      
      setCart(prev => ({
        ...prev,
        items: updatedItems
      }));

      // 重新計算總金額
      const newTotal = updatedItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
      setTotal(Number(newTotal));

      setTimeout(() => {
        loadCartFromDB(); // ← 載入最新資料
      }, 300);
    } catch (error) {
      console.error('更新數量失敗:', error);
      alert('更新數量失敗');
    }
  };

  // 移除商品
  const removeItem = async (productId: string, groupBuyId: string | undefined) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;
  
    try {
      await fetch(`http://localhost:3000/api/cart/${user.id}/${productId}`, {
        method: 'DELETE',
      });
      await loadCartFromDB(); // ← 載入最新資料
    } catch (error) {
      console.error('刪除商品失敗:', error);
      alert('刪除商品失敗');
    }
  };

  // 清空購物車
  const clearCart = async () => {
    if (!confirm('確定要清空購物車嗎？')) return;
  
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;
  
    try {
      await fetch(`http://localhost:3000/api/cart/${user.id}`, {
        method: 'DELETE',
      });
      setTimeout(() => {
        loadCartFromDB();// ← 載入最新資料
      }, 300); 
    } catch (error) {
      console.error('清空購物車失敗:', error);
      alert('清空購物車失敗');
    }
  };

  // 結帳
  const checkout = async () => {
    if (cart.items.length === 0) {
      alert('購物車為空，無法結帳');
      return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('🔥 user:', user);
    const user_id = user.id;

    const itemsWithGroupId = cart.items.map(item => ({
      ...item,
      groupbuy_id: item.groupbuy_id ?? item.id,
    }));
  
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items,
          user_id: user.id,
        }),
      });
  
      if (!res.ok) {
        const errData = await res.json();
        alert(`結帳失敗: ${errData.error}`);
        return;
      }
  
      setNotification(`下單成功！總金額：$${total.toFixed(2)}`);
  
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
  
      const emptyCart = { items: [], groupBuys: [] };
      localStorage.setItem('cart', JSON.stringify(emptyCart));
      setCart(emptyCart);
    } catch (error) {
      console.error('結帳失敗:', error);
      alert('結帳失敗，請稍後再試');
    }
  };

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
      
        <Card>
        <CardHeader>
          <CardTitle>購物車內容</CardTitle>
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
              {cart.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">購物車為空</TableCell>
                </TableRow>
              ) : (
                cart.items.map((item) => (
                  <TableRow key={`${item.id}-${item.groupbuy_id ?? 'no-group'}`}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline"
                          onClick={() => updateQuantity(item.id, item.groupbuy_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}>
                          -
                        </Button>
                        <Input type="number" value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, item.groupbuy_id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center" />
                        <Button size="sm" variant="outline"
                          onClick={() => updateQuantity(item.id, item.groupbuy_id, item.quantity + 1)}>
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>${Number(item.unitPrice).toFixed(2)}</TableCell>
                    <TableCell>${Number(item.totalPrice).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive"
                        onClick={() => removeItem(item.id, item.groupbuy_id)}>
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
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between mb-4">
            <Button
              variant="destructive"
              onClick={clearCart}
              disabled={cart.items.length === 0}
            >
              清空購物車
            </Button>
            
          </div>
          <div className="border-t pt-4">
            <p className="font-bold">總計: ${total.toFixed(2)}</p>
            <Button
              className="w-full mt-2"
              onClick={checkout}
              disabled={cart.items.length === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> 下單
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}