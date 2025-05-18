'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, []);

  if (!checked) return null; // 也可以回傳 loading 畫面

  return <>{children}</>;
}
