'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import insforge from '@/lib/insforge';

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  shipping_address: string;
  design_notes?: string;
  sizing_notes?: string;
  created_at: string;
  customer: {
    full_name: string;
    email: string;
    phone: string;
  };
  order_images: {
    image_type: string;
    image_url: string;
  }[];
  payment_details?: {
    payment_screenshot_url: string;
    sender_name: string;
    sender_upi_id: string;
    upi_transaction_id: string;
    amount_paid: number;
    payment_date: string;
    refund_status: string;
    refund_date?: string;
  };
}

const ORDER_STATUSES = [
  'Order Placed',
  'Payment Verified',
  'Preparation Started',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Refund Pending',
  'Refund Completed',
];

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const { data, error } = await insforge.database
        .from('orders')
        .select(`
          *,
          customer:customers(full_name, email, phone),
          order_images(image_type, image_url),
          payment_details(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await insforge.database
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrderDetail();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleRefundComplete = async () => {
    if (!confirm('Mark refund as completed?')) return;

    setUpdating(true);
    try {
      // Update payment details
      const { error: paymentError } = await insforge.database
        .from('payment_details')
        .update({ 
          refund_status: 'completed',
          refund_date: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (paymentError) throw paymentError;

      // Update order status
      const { error: orderError } = await insforge.database
        .from('orders')
        .update({ 
          payment_status: 'refund_completed',
          status: 'Refund Completed'
        })
        .eq('id', orderId);

      if (orderError) throw orderError;
      fetchOrderDetail();
    } catch (error) {
      console.error('Error completing refund:', error);
      alert('Failed to complete refund');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading order details...</div>;
  }

  if (!order) {
    return <div className="text-center py-12">Order not found</div>;
  }

  const inspirationImage = order.order_images.find(img => img.image_type === 'inspiration')?.image_url;
  const nailPhoto = order.order_images.find(img => img.image_type === 'nail_photo')?.image_url;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-6 text-rose-gold hover:underline flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Orders
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                  {order.order_number || order.id.slice(0, 8)}
                </h1>
                <p className="text-foreground/60">Order Date: {formatDate(order.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="font-serif text-3xl font-bold text-rose-gold">₹{order.total_amount}</p>
              </div>
            </div>

            {/* Status Management */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Order Status
                </label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updating}
                  className="w-full px-4 py-3 rounded-xl border border-rose-gold/20 bg-white/90 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none disabled:opacity-50"
                >
                  {ORDER_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {order.payment_status === 'refund_pending' && (
                <button
                  onClick={handleRefundComplete}
                  disabled={updating}
                  className="w-full px-4 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Processing...' : 'Mark Refund as Completed'}
                </button>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-foreground/60">Name</p>
                <p className="font-medium text-foreground">{order.customer?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Email</p>
                <p className="font-medium text-foreground">{order.customer?.email}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Phone</p>
                <p className="font-medium text-foreground">{order.customer?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Shipping Address</p>
                <p className="font-medium text-foreground">{order.shipping_address}</p>
              </div>
            </div>
          </div>

          {/* Order Images */}
          {(inspirationImage || nailPhoto) && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-semibold text-foreground mb-4">Order Images</h2>
              <div className="grid grid-cols-2 gap-4">
                {inspirationImage && (
                  <div>
                    <p className="text-sm text-foreground/60 mb-2">Inspiration Image</p>
                    <img
                      src={inspirationImage}
                      alt="Inspiration"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  </div>
                )}
                {nailPhoto && (
                  <div>
                    <p className="text-sm text-foreground/60 mb-2">Natural Nail Photo</p>
                    <img
                      src={nailPhoto}
                      alt="Natural Nail"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {(order.design_notes || order.sizing_notes) && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-semibold text-foreground mb-4">Order Notes</h2>
              {order.design_notes && (
                <div className="mb-4">
                  <p className="text-sm text-foreground/60 mb-1">Design Notes</p>
                  <p className="text-foreground">{order.design_notes}</p>
                </div>
              )}
              {order.sizing_notes && (
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Sizing Notes</p>
                  <p className="text-foreground">{order.sizing_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Payment Details</h2>
            
            {order.payment_details ? (
              <div className="space-y-4">
                {order.payment_details.payment_screenshot_url && (
                  <div>
                    <p className="text-sm text-foreground/60 mb-2">Payment Screenshot</p>
                    <img
                      src={order.payment_details.payment_screenshot_url}
                      alt="Payment Screenshot"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-foreground/60">Sender Name</p>
                  <p className="font-medium text-foreground">{order.payment_details.sender_name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-foreground/60">Sender UPI ID</p>
                  <p className="font-medium text-foreground">{order.payment_details.sender_upi_id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-foreground/60">Transaction ID</p>
                  <p className="font-medium text-foreground">{order.payment_details.upi_transaction_id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-foreground/60">Amount Paid</p>
                  <p className="font-medium text-foreground">₹{order.payment_details.amount_paid}</p>
                </div>
                
                <div>
                  <p className="text-sm text-foreground/60">Payment Date</p>
                  <p className="font-medium text-foreground">{formatDate(order.payment_details.payment_date)}</p>
                </div>

                {order.payment_details.refund_status !== 'none' && (
                  <div className="pt-4 border-t border-rose-gold/20">
                    <p className="text-sm text-foreground/60">Refund Status</p>
                    <p className={`font-medium ${
                      order.payment_details.refund_status === 'completed' 
                        ? 'text-green-600' 
                        : 'text-amber-600'
                    }`}>
                      {order.payment_details.refund_status.toUpperCase()}
                    </p>
                    {order.payment_details.refund_date && (
                      <p className="text-sm text-foreground/60 mt-1">
                        Refund Date: {formatDate(order.payment_details.refund_date)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-foreground/60">No payment details available</p>
            )}
          </div>

          {/* Payment Status */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Payment Status</h2>
            <div className={`px-4 py-3 rounded-xl text-center font-medium ${
              order.payment_status === 'verified' 
                ? 'bg-green-100 text-green-800' 
                : order.payment_status === 'refund_pending'
                ? 'bg-amber-100 text-amber-800'
                : order.payment_status === 'refund_completed'
                ? 'bg-teal-100 text-teal-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {order.payment_status.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
