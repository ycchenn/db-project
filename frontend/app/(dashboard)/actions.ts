// frontend/app/dashboard/products/actions.ts
'use server';

import { deleteGroupbuyById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteProduct(formData: FormData) {
  const id = Number(formData.get('id'));
  await deleteGroupbuyById(id);
  revalidatePath('/dashboard/products');
}