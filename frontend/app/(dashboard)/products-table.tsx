'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Product, Groupbuy } from './product';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProductsTable({
  products,
  offset,
  totalProducts,
}: {
  products: Groupbuy[];
  offset: number;
  totalProducts: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productsPerPage = 5;

  function prevPage() {
    const newOffset = Math.max(0, offset - productsPerPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', newOffset.toString());
    router.push(`/dashboard/products?${params.toString()}`, { scroll: false });
  }

  function nextPage() {
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', offset.toString());
    router.push(`/dashboard/products?${params.toString()}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>商品瀏覽</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>商品名稱</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="hidden md:table-cell">價格</TableHead>
              <TableHead className="hidden md:table-cell">人數</TableHead>
              <TableHead className="hidden md:table-cell">截止日</TableHead>
              <TableHead>
                <span className="sr-only">操作</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(products) ? (
              products.map((product) => (
                <Product key={product.id} product={product} />
              ))
            ) : (
              <p className="text-red-500">❌ 無法載入團購資料</p>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            顯示{' '}
            <strong>
              {Number.isFinite(offset) && Number.isFinite(totalProducts) ? (
                <>
                  {Math.max(0, Math.min(offset - productsPerPage, totalProducts) + 1)}–{Math.min(offset, totalProducts)}
                </>
              ) : (
                <>0–0</>
              )}
            </strong>{' '}
            共 <strong>{totalProducts}</strong> 筆團購
          </div>
          <div className="flex">
            <Button
              onClick={prevPage}
              variant="ghost"
              size="sm"
              type="button"
              disabled={offset === productsPerPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              上一頁
            </Button>
            <Button
              onClick={nextPage}
              variant="ghost"
              size="sm"
              type="button"
              disabled={offset >= totalProducts}
            >
              下一頁
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
