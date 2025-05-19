// frontend/app/dashboard/products/product.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, X } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';

export type Groupbuy = {
  id: number;
  title: string;
  price: number;
  status: string;
  current_count: number;
  max_count: number;
  deadline: string;
  image_url?: string;
  description?: string;
};

export function Product({ product, addToCart, onShowModal }: { product: Groupbuy; addToCart: (id: number, title: string, price: number, quantity: number) => void; onShowModal: (product: Groupbuy) => void }) {
  const [quantity, setQuantity] = useState(1);

  const isClosed = product.status.toLowerCase() === 'closed';
  const canAddToCart = !isClosed && product.current_count < product.max_count;

  const handleAddToCart = () => {
    if (canAddToCart && quantity > 0) {
      addToCart(product.id, product.title, product.price, quantity);
      setQuantity(1); // Reset quantity after adding
    }
  };

  return (
    <TableRow
      onClick={() => !isClosed && onShowModal(product)}
      className={isClosed ? '' : 'cursor-pointer hover:bg-gray-100'}
    >
      <TableCell className="hidden sm:table-cell">
        {product.image_url ? (
          <Image
            alt="Product image"
            className="aspect-square rounded-md object-cover"
            height={64}
            width={64}
            src={product.image_url}
          />
        ) : (
          <span className="text-sm text-muted-foreground">無圖片</span>
        )}
      </TableCell>
      <TableCell className="font-medium">{product.title}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">{product.status}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        ${Number(product.price).toFixed(2)}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {product.current_count} / {product.max_count}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {new Date(product.deadline).toLocaleDateString('zh-TW')}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={product.max_count - product.current_count}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value), product.max_count - product.current_count)))}
            className="w-16 p-1 border rounded"
            disabled={isClosed}
          />
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!canAddToCart}
          >
            放入購物車
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}