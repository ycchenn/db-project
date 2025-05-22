'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductsTable } from './products-table';
import { getGroupbuys, Groupbuy } from '@/lib/db';
import { useSearchParams, useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function GroupbuysPage() {
  const [groupbuys, setGroupbuys] = useState<Groupbuy[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ id: number; title: string; price: number; quantity: number }[]>([]);

  const searchParams = useSearchParams();
  const offset = Number(searchParams.get('offset')) || 0; // 保留 offset 供未來使用，但不影響當前邏輯
  const groupbuysPerPage = 5; // 保留，但不使用
  const router = useRouter();

  useEffect(() => {

    const user_id = localStorage.getItem('userId');
    if (!user_id) {
      alert('請先登入');
      router.push('/login');
      return;
    }

    setLoading(true);
    getGroupbuys()
      .then((data) => {
        setGroupbuys(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Failed to fetch groupbuys:', {
          message: err.message,
          stack: err.stack,
          name: err.name,
          response: err.response ? err.response.statusText : 'No response',
        });
        setLoading(false);
      });
  }, [offset]);

  // 移除分頁限制，顯示所有團購
  const allGroupbuys = groupbuys; // 直接使用完整 groupbuys
  const paginatedOpen = groupbuys
    .filter((groupbuy) => groupbuy.status.toLowerCase() === 'open')
    .slice(offset, offset + groupbuysPerPage);
  const paginatedFull = groupbuys
    .filter((groupbuy) => groupbuy.status.toLowerCase() === 'full')
    .slice(offset, offset + groupbuysPerPage);
  const paginatedClosed = groupbuys
    .filter((groupbuy) => groupbuy.status.toLowerCase() === 'closed')
    .slice(offset, offset + groupbuysPerPage);

  const addToCart = (id: number, title: string, price: number, quantity: number): void => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { id, title, price, quantity }];
    });
  };

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center mb-4">
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="進行中">進行中</TabsTrigger>
          <TabsTrigger value="已成團">已成團</TabsTrigger>
          <TabsTrigger value="已關閉" className="hidden sm:flex">
            已關閉
          </TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  購物車 ({cart.length})
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {cart.length === 0 ? (
                <DropdownMenuItem disabled>購物車為空</DropdownMenuItem>
              ) : (
                cart.map((item) => (
                  <DropdownMenuItem key={item.id}>
                    {item.title} - ${item.price} x {item.quantity} = $
                    {(item.price * item.quantity).toFixed(2)}
                  </DropdownMenuItem>
                ))
              )}
              {cart.length > 0 && (
                <DropdownMenuItem>
                  總計: $
                  {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                </DropdownMenuItem>
              )}
              {cart.length > 0 && (
                <DropdownMenuItem>
                  <Button
                    size="sm"
                    className="h-8 gap-1 w-full"
                    onClick={() => router.push('/orders')}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>結帳</span>
                  </Button>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TabsContent value="all">
        {loading ? (
          <p className="text-muted-foreground">載入中...</p>
        ) : (
          <ProductsTable
            products={allGroupbuys}
            offset={offset}
            totalProducts={groupbuys.length}
            addToCart={addToCart}
          />
        )}
      </TabsContent>

      <TabsContent value="進行中">
        {loading ? (
          <p className="text-muted-foreground">載入中...</p>
        ) : (
          <ProductsTable
            products={paginatedOpen}
            offset={offset}
            totalProducts={groupbuys.filter((groupbuy) => groupbuy.status.toLowerCase() === 'open').length}
            addToCart={addToCart}
          />
        )}
      </TabsContent>

      <TabsContent value="已成團">
        {loading ? (
          <p className="text-muted-foreground">載入中...</p>
        ) : (
          <ProductsTable
            products={paginatedFull}
            offset={offset}
            totalProducts={groupbuys.filter((groupbuy) => groupbuy.status.toLowerCase() === 'full').length}
            addToCart={addToCart}
          />
        )}
      </TabsContent>

      <TabsContent value="已關閉">
        {loading ? (
          <p className="text-muted-foreground">載入中...</p>
        ) : (
          <ProductsTable
            products={paginatedClosed}
            offset={offset}
            totalProducts={groupbuys.filter((groupbuy) => groupbuy.status.toLowerCase() === 'closed').length}
            addToCart={addToCart}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}