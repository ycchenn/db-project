// frontend/lib/db.ts
export type SelectProduct = {
  id: number;
  name: string;
  status: string;
  price: string; // 後端可能返回字符串，需在前端轉為數字
  stock: number;
  imageUrl: string;
  availableAt: string; // 後端返回的日期為字符串
};

export async function getProducts(search: string, offset: number) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const productsPerPage = 5; // 與 products-table.tsx 一致
  const response = await fetch(
    `${API_URL}/v1/products?q=${encodeURIComponent(
      search
    )}&offset=${offset}&limit=${productsPerPage}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json();
  console.log('🔥 後端回傳資料：', data); // ← 留著debug
  return {
    products: data,
    newOffset: offset + productsPerPage,
    totalProducts: data.length
  };
}

export async function deleteProductById(id: number) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const response = await fetch(`${API_URL}/v1/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete product');
  }
}