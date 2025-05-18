// frontend/app/dashboard/products/product.tsx
'use client';

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
import { MoreHorizontal } from 'lucide-react';
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
};

export function Product({ product }: { product: Groupbuy }) {
  return (
    <TableRow>
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
        
      </TableCell>
    </TableRow>
  );
}
