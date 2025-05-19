// frontend/app/dashboard/products/product.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export function Product({
  product,
  onShowModal,
  groupBuyId,
  groupBuyOwner = '團長', // 預設團主名稱，實際應從後端獲取
}: {
  product: Groupbuy;
  onShowModal: (product: Groupbuy) => void;
  groupBuyId?: string;
  groupBuyOwner?: string;
}) {
  const [quantity, setQuantity] = useState(1);

  const isClosed = product.status.toLowerCase() === 'closed';
  const canAddToCart = !isClosed && product.current_count < product.max_count;

  const handleAddToCart = () => {
    if (!canAddToCart || quantity <= 0) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '{"items":[],"groupBuys":[]}');
    const unitPrice = Number(product.price);
    if (isNaN(unitPrice)) {
      alert('商品價格無效，無法加入購物車');
      return;
    }

    const newItem = {
      id: product.id.toString(),
      name: product.title,
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity,
      group_buy_id: groupBuyId,
    };

    const existingItem = cart.items.find(
      (item: any) => item.id === newItem.id && item.group_buy_id === newItem.group_buy_id
    );
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
    } else {
      cart.items.push(newItem);
    }

    if (groupBuyId) {
      const existingGroupBuy = cart.groupBuys.find((gb: any) => gb.groupId === groupBuyId);
      if (!existingGroupBuy) {
        cart.groupBuys.push({
          groupId: groupBuyId,
          owner: groupBuyOwner,
          targetQuantity: 10,
          currentQuantity: 5,
          deadline: product.deadline,
          status: 'active',
        });
      }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('已加入購物車');
    setQuantity(1);
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
      <TableCell className="hidden md:table-cell">${Number(product.price).toFixed(2)}</TableCell>
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
            onChange={(e) =>
              setQuantity(Math.max(1, Math.min(Number(e.target.value), product.max_count - product.current_count)))
            }
            className="w-16 p-1 border rounded"
            disabled={isClosed}
          />
          <Button size="sm" onClick={handleAddToCart} disabled={!canAddToCart}>
            放入購物車
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}