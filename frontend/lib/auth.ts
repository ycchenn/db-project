// frontend/lib/auth.ts
export async function auth() {
  // 檢查是否在瀏覽器環境
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (!token || !user) return null;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/user/verify`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }

  return { user: JSON.parse(user) };
}

export async function signOut() {
  // 僅在瀏覽器環境執行
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}