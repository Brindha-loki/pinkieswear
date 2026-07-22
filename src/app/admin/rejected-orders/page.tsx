'use client';

import React, { useEffect, useState, useCallback } from 'react';
import insforge from '@/lib/insforge';
import { OrderTable, type AdminOrder } from '@/components/admin/OrderTable';
import { OrderDetailModal } from '@/components/admin/OrderDetailModal';

export default function RejectedOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await insforge.database
        .from('orders')
        .select(`
          id, order_number, status, payment_status, total_amount, created_at,
          shipping_address, design_notes, sizing_notes, gallery_product_id,
          inspiration_image_url, nail_size_image_url, rejected_at, rejection_reason,
          customer:customers(full_name, email, phone, whatsapp),
          payment_details(*)
        `)
        .eq('status', 'Cancelled')
        .order('rejected_at', { ascending: false });

      if (error) throw error;
      setOrders((data as any[]) || []);
    } catch (err) {
      console.error('[RejectedOrders] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleAccept = async (order: AdminOrder) => {
    if (!confirm(`Restore order ${order.order_number} back to active orders?`)) return;
    setActionLoading(order.id);
    try {
      const { error } = await insforge.database
        .from('orders')
        .update({
          status: 'Order Placed',
          payment_status: 'pending',
          rejected_at: null,
          rejection_reason: null,
        })
        .eq('id', order.id);

      if (error) throw error;
      fetchOrders();
    } catch (err) {
      console.error('[RejectedOrders] accept error:', err);
      alert('Failed to restore order.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRefund = async (order: AdminOrder) => {
    setActionLoading(order.id);
    try {
      const currentRefundStatus = order.payment_details?.[0]?.refund_status || 'none';
      const newRefundStatus = currentRefundStatus === 'completed' ? 'none' : 'completed';
      
      const { error } = await insforge.database
        .from('payment_details')
        .update({ refund_status: newRefundStatus })
        .eq('order_id', order.id);

      if (error) throw error;
      fetchOrders();
    } catch (err) {
      console.error('[RejectedOrders] refund toggle error:', err);
      alert('Failed to update refund status.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Rejected Orders</h1>
          <p className="text-sm text-foreground/50 mt-1">Orders you have rejected — no data is deleted</p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-rose-gold/10 hover:bg-rose-gold/20 text-rose-gold rounded-xl text-sm font-medium transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-foreground/50">Loading rejected orders...</div>
      ) : (
        <OrderTable
          orders={orders}
          mode="rejected"
          onViewDetails={setSelectedOrder}
          onAccept={handleAccept}
          onToggleRefund={handleToggleRefund}
          actionLoading={actionLoading}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
