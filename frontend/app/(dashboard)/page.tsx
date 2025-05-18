'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductsTable } from './products-table';
import { getGroupbuys, Groupbuy } from '@/lib/db';
import { useSearchParams, useRouter } from 'next/navigation';

export default function GroupbuysPage() {
  const [groupbuys, setGroupbuys] = useState<Groupbuy[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const offset = Number(searchParams.get('offset')) || 0;
  const groupbuysPerPage = 5;

  useEffect(() => {
    getGroupbuys()
      .then((data) => {
        setGroupbuys(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ fetch groupbuys error:', err);
        setLoading(false);
      });
  }, []);

  const paginated = groupbuys.slice(offset, offset + groupbuysPerPage);

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
          <Button size="sm" className="h-8 gap-1">
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              購物車
            </span>
          </Button>
        </div>
      </div>

      <TabsContent value="all">
        {loading ? (
          <p className="text-muted-foreground">載入中...</p>
        ) : (
          <ProductsTable
            products={paginated}
            offset={offset}
            totalProducts={groupbuys.length}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
