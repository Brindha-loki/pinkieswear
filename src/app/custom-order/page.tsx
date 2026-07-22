import React, { Suspense } from 'react';
import CustomOrderFlow from '@/components/CustomOrderFlow';

export default function CustomOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CustomOrderFlow />
    </Suspense>
  );
}
