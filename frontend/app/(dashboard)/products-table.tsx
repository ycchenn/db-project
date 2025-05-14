// frontend/app/dashboard/products/products-table.tsx
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
import { Product } from './product';
import { SelectProduct } from '@/lib/db';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProductsTable({
  products,
  offset,
  totalProducts,
}: {
  products: SelectProduct[];
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
        <CardTitle>Products</CardTitle>
        <CardDescription>
          Manage your products and view their sales performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden md:table-cell">Stock</TableHead>
              <TableHead className="hidden md:table-cell">Created at</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(products) ? (
            products.map((product) => (
              <Product key={product.id} product={product} />
            ))
          ) : (
            <p className="text-red-500">❌ 無法載入產品資料</p>//防止網頁直接炸掉
          )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
            {Number.isFinite(offset) && Number.isFinite(totalProducts) ? (
              <>
                {Math.max(0, Math.min(offset - productsPerPage, totalProducts) + 1)}–
                {Math.min(offset, totalProducts)}
              </>
            ) : (
              <>0–0</>
            )}
            </strong>{' '}
            of <strong>{totalProducts}</strong> products
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
              Prev
            </Button>
            <Button
              onClick={nextPage}
              variant="ghost"
              size="sm"
              type="button"
              disabled={offset >= totalProducts}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}