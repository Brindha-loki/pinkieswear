'use client';

import React, { useEffect, useState, useCallback } from 'react';
import insforge from '@/lib/insforge';
import { OrderTable, type AdminOrder } from '@/components/admin/OrderTable';
import { OrderDetailModal } from '@/components/admin/OrderDetailModal';
import { RejectConfirmModal } from '@/components/admin/RejectConfirmModal';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<AdminOrder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [updatingStatusOrder, setUpdatingStatusOrder] = useState<AdminOrder | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await insforge.database
        .from('orders')
        .select(`
          id, order_number, status, payment_status, total_amount, created_at,
          shipping_address, design_notes, sizing_notes, gallery_product_id,
          inspiration_image_url, nail_size_image_url, rejected_at, rejection_reason,
          nail_shape_id,
          customer:customers(full_name, email, phone, whatsapp),
          payment_details(*)
        `)
        .in('payment_status', ['pending', 'verified'])
        .in('status', ['Order Placed', 'Payment Verified', 'Preparation Started', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as any[]) || []);
    } catch (err: any) {
      console.error('[AdminOrders] fetch error:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        raw: err,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleReject = async (reason: string) => {
    if (!rejectingOrder) return;
    setActionLoading(true);
    try {
      console.log('[AdminOrders] Rejecting order:', rejectingOrder.id, 'Reason:', reason);
      const { error } = await insforge.database
        .from('orders')
        .update({
          status: 'Cancelled',
          rejected_at: new Date().toISOString(),
          rejection_reason: reason || null,
        })
        .eq('id', rejectingOrder.id);

      if (error) {
        console.error('[AdminOrders] Database error:', error);
        throw error;
      }
      console.log('[AdminOrders] Order rejected successfully');
      setRejectingOrder(null);
      fetchOrders();
    } catch (err: any) {
      console.error('[AdminOrders] reject error:', err);
      console.error('[AdminOrders] error details:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
      });
      alert(`Failed to reject order: ${err?.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (order: AdminOrder, newStatus: string) => {
    setUpdatingStatusOrder(order);
    try {
      console.log('[AdminOrders] Updating order status:', order.id, 'to:', newStatus);
      const { error } = await insforge.database
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (error) {
        console.error('[AdminOrders] Database error:', error);
        throw error;
      }
      console.log('[AdminOrders] Order status updated successfully');
      setUpdatingStatusOrder(null);
      fetchOrders();
    } catch (err: any) {
      console.error('[AdminOrders] status update error:', err);
      alert(`Failed to update order status: ${err?.message || 'Unknown error'}`);
      setUpdatingStatusOrder(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-foreground/50 mt-1">Showing orders awaiting verification and verified orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-rose-gold/10 hover:bg-rose-gold/20 text-rose-gold rounded-xl text-sm font-medium transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-foreground/50">Loading orders...</div>
      ) : (
        <OrderTable
          orders={orders}
          mode="active"
          onViewDetails={setSelectedOrder}
          onReject={setRejectingOrder}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {rejectingOrder && (
        <RejectConfirmModal
          orderNumber={rejectingOrder.order_number}
          onConfirm={handleReject}
          onCancel={() => setRejectingOrder(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

