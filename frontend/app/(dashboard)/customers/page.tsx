// frontend/app/dashboard/customers/page.tsx
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Customer = {
  id: number;
  name: string;
  email: string;
  total_orders: number;
  created_at: string;
};

async function getCustomers(search: string, offset: number) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const response = await fetch(
    `${API_URL}/v1/customers?q=${encodeURIComponent(
      search
    )}&offset=${offset}&limit=5`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }

  return response.json();
}

export default function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; offset?: string };
}) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const search = searchParams.q ?? '';
  const offset = Number(searchParams.offset) || 0;
  const productsPerPage = 5;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newOffset, setNewOffset] = useState<number | null>(null);

  useEffect(() => {
    getCustomers(search, offset).then((data) => {
      setCustomers(data.customers);
      setTotalCustomers(data.totalCustomers);
      setNewOffset(data.newOffset);
    });
  }, [search, offset]);

  function prevPage() {
    const newOffset = Math.max(0, offset - productsPerPage);
    const params = new URLSearchParams(searchParamsHook.toString());
    params.set('offset', newOffset.toString());
    router.push(`/dashboard/customers?${params.toString()}`, { scroll: false });
  }

  function nextPage() {
    const params = new URLSearchParams(searchParamsHook.toString());
    params.set('offset', newOffset?.toString() || offset.toString());
    router.push(`/dashboard/customers?${params.toString()}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>View all customers and their orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.total_orders}</TableCell>
                <TableCell>
                  {new Date(customer.created_at).toLocaleDateString('en-US')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <div className="flex items-center w-full justify-between p-4">
        <div className="text-xs text-muted-foreground">
          Showing{' '}
          <strong>
            {Math.max(0, Math.min(offset - productsPerPage, totalCustomers) + 1)}-
            {Math.min(offset, totalCustomers)}
          </strong>{' '}
          of <strong>{totalCustomers}</strong> customers
        </div>
        <div className="flex">
          <Button
            onClick={prevPage}
            variant="ghost"
            size="sm"
            type="button"
            disabled={offset === productsPerPage}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Prev
          </Button>
          <Button
            onClick={nextPage}
            variant="ghost"
            size="sm"
            type="button"
            disabled={newOffset === null || offset >= totalCustomers}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}