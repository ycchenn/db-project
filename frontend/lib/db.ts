export type Groupbuy = {
  id: number;
  title: string;
  description: string;
  price: number;
  status: string;
  current_count: number;
  max_count: number;
  deadline: string;
  image_url: string;
};

// 若有需求支援分頁與搜尋，可擴充參數
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getGroupbuys(): Promise<Groupbuy[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const response = await fetch(`${API_URL}/api/groupbuys`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch groupbuys');
  }

  return await response.json();
}



export async function deleteGroupbuyById(id: number) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const res = await fetch(`${API_URL}/api/groupbuys/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to delete groupbuy');
  }
}
