'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getGroupbuys, Groupbuy } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductsTable } from './products-table';

//const offset = Number(searchParams.get('offset')) || 0;
const offset = 0;  // 固定不分頁，offset 永遠是 0


export default function GroupbuysPage() {
  const [groupbuys, setGroupbuys] = useState<Groupbuy[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ id: number; title: string; price: number; quantity: number }[]>([]);

  //const searchParams = useSearchParams();
  //const offset = Number(searchParams.get('offset')) || 0; // 保留 offset 供未來使用，但不影響當前邏輯
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