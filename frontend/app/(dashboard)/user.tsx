'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    __CURRENT_USER_ID__?: string;
  }
}

export default function User() {
  const [user, setUser] = useState<{ email: string | null } | null>(null);

  useEffect(() => {
    // 嘗試從 localStorage 判斷登入狀態
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail'); // 可選
    if (userId) {
      setUser({ email: email ?? null });
    }
    // --- 新增: 讓全域都能取得 userId ---
    if (userId) {
      window.__CURRENT_USER_ID__ = userId;
    }
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
          <Image
            src="/placeholder-user.jpg"
            width={36}
            height={36}
            alt="Avatar"
            className="overflow-hidden rounded-full"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {user?.email ?? 'My Account'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem
            onClick={() => {
              localStorage.removeItem('userId');
              localStorage.removeItem('userEmail'); // 如果有存
              window.location.href = '/login';
            }}
          >
            Sign Out
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem>
              <Link href="/login" className="w-full">
                Sign In
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/register" className="w-full">
                Sign Up
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
