'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/lib/AuthContext';
import insforge from '@/lib/insforge';
import OrderProgressTracker, { OrderStatus } from '@/components/OrderProgressTracker';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  design_notes?: string;
  sizing_notes?: string;
  inspiration_image_url?: string;
  nail_size_image_url?: string;
  rejected_at?: string;
  rejection_reason?: string;
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
    refund_status?: string;
  }[];
}

export default function MyOrdersPage() {
  const { user, userId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await insforge.database
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          order_images(*),
          payment_details(refund_status)
        `)
        .eq('customer.auth_id', userId)
        .in('payment_status', ['pending', 'verified'])
        .in('status', ['Order Placed', 'Payment Verified', 'Preparation Started', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancellingOrderId(orderId);
    try {
      const { error } = await insforge.database
        .from('orders')
        .update({ status: 'Cancelled' })
        .eq('id', orderId);

      if (error) throw error;

      // Refresh orders
      fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const canCancelOrder = (status: string) => {
    return status === 'Order Placed' || status === 'Payment Verified';
  };

  const isCurrentOrder = (status: string) => {
    return !['Delivered', 'Refund Completed', 'Cancelled'].includes(status);
  };

  const currentOrders = orders.filter(order => isCurrentOrder(order.status));
  const previousOrders = orders.filter(order => !isCurrentOrder(order.status));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Please login to view your orders</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-rose-gold text-white rounded-full"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              My Orders 💖
            </h1>
            <p className="text-foreground/70 text-lg">
              Track your nail orders and their progress
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-foreground/70">Loading orders...</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-foreground/70 mb-8">You haven't placed any orders yet</p>
              <button
                onClick={() => window.location.href = '/#gallery'}
                className="px-6 py-3 bg-gradient-to-r from-rose-gold to-blush-pink text-white rounded-full font-medium"
              >
                Browse Gallery
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Current Orders */}
              {currentOrders.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                    Current Orders ({currentOrders.length})
                  </h2>
                  <div className="grid gap-6">
                    {currentOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onCancel={() => handleCancelOrder(order.id)}
                        canCancel={canCancelOrder(order.status)}
                        isCancelling={cancellingOrderId === order.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Previous Orders */}
              {previousOrders.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                    Previous Orders ({previousOrders.length})
                  </h2>
                  <div className="grid gap-6">
                    {previousOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onCancel={() => {}}
                        canCancel={false}
                        isCancelling={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onCancel: () => void;
  canCancel: boolean;
  isCancelling: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onCancel, canCancel, isCancelling }) => {
  // Use direct image URLs (new architecture) with fallback to order_images table (legacy)
  const inspirationImage = order.inspiration_image_url ||
    order.order_images.find(img => img.image_type === 'inspiration')?.image_url;
  const nailPhoto = order.nail_size_image_url ||
    order.order_images.find(img => img.image_type === 'nail_photo')?.image_url;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Order Images */}
        <div className="flex gap-4 md:w-48">
          {inspirationImage && (
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-baby-pink to-blush-pink flex-shrink-0">
              <img src={inspirationImage} alt="Inspiration" className="w-full h-full object-cover" />
            </div>
          )}
          {nailPhoto && (
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-baby-pink to-blush-pink flex-shrink-0">
              <img src={nailPhoto} alt="Nail Photo" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
                {order.order_number}
              </h3>
              <p className="text-sm text-foreground/60">
                Order Date: {formatDate(order.created_at)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-2xl font-bold text-rose-gold">
                ₹{order.total_amount}
              </p>
              <p className="text-sm text-foreground/60">
                {order.payment_status === 'done' ? '✓ Payment Done' : `Payment: ${order.payment_status}`}
              </p>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="mb-4">
            <OrderProgressTracker currentStatus={order.status as OrderStatus} />
          </div>

          {/* Status Message */}
          <div className="mb-4 bg-rose-gold/10 rounded-xl p-4">
            <p className="text-sm text-foreground/80">
              {order.status === 'Order Placed' && 'Your order has been placed successfully.'}
              {order.status === 'Payment Verified' && 'Your payment has been verified. Preparation will begin soon.'}
              {order.status === 'Preparation Started' && 'Your order is being prepared by our artists.'}
              {order.status === 'Packed' && 'Your order has been packed and is ready for shipping.'}
              {order.status === 'Shipped' && 'Your order has been shipped and is on its way to you.'}
              {order.status === 'Out for Delivery' && 'Your order is out for delivery and will reach you soon.'}
              {order.status === 'Delivered' && 'Your order has been delivered successfully. Enjoy your nails!'}
              {order.status === 'Cancelled' && order.payment_details?.[0]?.refund_status === 'done' && order.rejection_reason && `Your order has been rejected by admin. Reason: ${order.rejection_reason}. Refund completed.`}
              {order.status === 'Cancelled' && order.payment_details?.[0]?.refund_status === 'done' && !order.rejection_reason && 'Your order has been rejected by admin. Refund completed.'}
              {order.status === 'Cancelled' && order.payment_details?.[0]?.refund_status !== 'done' && order.rejection_reason && `Your order has been rejected by admin. Reason: ${order.rejection_reason}. You will be refunded shortly.`}
              {order.status === 'Cancelled' && order.payment_details?.[0]?.refund_status !== 'done' && !order.rejection_reason && 'Your order has been rejected by admin. You will be refunded shortly.'}
            </p>
          </div>

          {/* Additional Details */}
          {order.design_notes && (
            <div className="mb-3">
              <p className="text-sm text-foreground/50">Design Notes:</p>
              <p className="text-sm text-foreground/70">{order.design_notes}</p>
            </div>
          )}

          {order.sizing_notes && (
            <div className="mb-4">
              <p className="text-sm text-foreground/50">Sizing Notes:</p>
              <p className="text-sm text-foreground/70">{order.sizing_notes}</p>
            </div>
          )}

          {/* Cancel Button */}
          {canCancel && (
            <div className="flex items-center justify-between pt-4 border-t border-rose-gold/20">
              <p className="text-sm text-foreground/60">
                You can cancel this order before preparation begins
              </p>
              <button
                onClick={onCancel}
                disabled={isCancelling}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          )}

          {!canCancel && order.status !== 'Cancelled' && (
            <div className="pt-4 border-t border-rose-gold/20">
              <p className="text-sm text-foreground/60">
                {order.status === 'Preparation Started' 
                  ? 'Cancellation is unavailable because preparation has already begun.'
                  : 'This order cannot be cancelled.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
