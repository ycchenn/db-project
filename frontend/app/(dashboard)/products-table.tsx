'use client';

import { useState } from 'react';
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
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductsTableProps {
  products: Groupbuy[];
  offset: number;
  totalProducts: number;
  addToCart: (id: number, title: string, price: number, quantity: number) => void;
}

export function ProductsTable({
  products,
  offset,
  totalProducts,
  addToCart,
}: ProductsTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Groupbuy | null>(null);

  const handleCloseModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedProduct(null);
    }
  };

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
              <TableHead>賣家名稱</TableHead>
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
                <Product
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                  onShowModal={setSelectedProduct}
                />
              ))
            ) : (
              <p className="text-red-500">❌ 無法載入團購資料</p>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          顯示共 <strong>{totalProducts}</strong> 筆團購
        </div>
      </CardFooter>
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-11/12 max-w-md">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedProduct(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedProduct.title}</h2>
            <p><strong>賣家名稱:</strong> {selectedProduct.seller_name || '未知賣家'}</p>
            <p><strong>狀態:</strong> {selectedProduct.status}</p>
            <p><strong>價格:</strong> ${Number(selectedProduct.price).toFixed(2)}</p>
            <p><strong>人數:</strong> {selectedProduct.current_count} / {selectedProduct.max_count}</p>
            <p><strong>截止日:</strong> {new Date(selectedProduct.deadline).toLocaleDateString('zh-TW')}</p>
            <p><strong>描述:</strong> {selectedProduct.description || '無描述'}</p>
            <div className="mt-4">
              <input
                type="number"
                min="1"
                max={selectedProduct.max_count - selectedProduct.current_count}
                defaultValue="1"
                className="w-16 p-1 border rounded mr-2"
                disabled={selectedProduct.status.toLowerCase() === 'closed'}
              />
              <Button
                size="sm"
                onClick={() => {
                  addToCart(selectedProduct.id, selectedProduct.title, selectedProduct.price, 1);
                  setSelectedProduct(null);
                }}
                disabled={selectedProduct.status.toLowerCase() === 'closed' || selectedProduct.current_count >= selectedProduct.max_count}
              >
                放入購物車
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}