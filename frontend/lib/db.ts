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
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function getGroupbuys(): Promise<Groupbuy[]> {
  try {
    const response = await fetch(`${API_URL}/api/groupbuys`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(`Failed to fetch groupbuys: HTTP ${response.status} - ${errorText}`);
      (error as any).status = response.status; // 添加 status 屬性到錯誤物件
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (err: unknown) {
    const error = err as Error & { status?: number }; // 強制轉換為目標類型
    console.error('Error in getGroupbuys:', {
      message: error.message,
      status: error.status || 'No status',
      url: `${API_URL}/api/groupbuys`,
    });
    throw err;
  }
}

export async function deleteGroupbuyById(id: number) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
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