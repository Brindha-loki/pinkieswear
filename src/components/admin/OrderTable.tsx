'use client';

import React, { useState } from 'react';
import { ImagePreview } from '@/components/admin/ImagePreview';

export interface AdminOrder {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  shipping_address?: string;
  design_notes?: string;
  sizing_notes?: string;
  inspiration_image_url?: string;
  nail_size_image_url?: string;
  gallery_product_id?: string | null;
  nail_shape_id?: string | null;
  nail_shape?: {
    name: string;
    description?: string;
  } | null;
  rejection_reason?: string;
  rejected_at?: string;
  customer: {
    full_name: string;
    email: string;
    phone: string;
    whatsapp?: string;
  };
  payment_details?: Array<{
    id: string;
    payment_screenshot_url?: string;
    sender_name?: string;
    sender_upi_id?: string;
    upi_transaction_id?: string;
    amount_paid?: number;
    payment_date?: string;
    refund_status?: string;
    payment_method?: string;
    payment_gateway_id?: string;
    gateway_order_id?: string;
    notes?: string;
  }>;
}

interface OrderTableProps {
  orders: AdminOrder[];
  mode: 'active' | 'rejected';
  onViewDetails: (order: AdminOrder) => void;
  onReject?: (order: AdminOrder) => void;
  onAccept?: (order: AdminOrder) => void;
  onUpdateStatus?: (order: AdminOrder, newStatus: string) => void;
  onToggleRefund?: (order: AdminOrder) => void;
  actionLoading?: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  'Order Placed': 'bg-yellow-100 text-yellow-800',
  'Payment Verified': 'bg-green-100 text-green-800',
  'Preparation Started': 'bg-blue-100 text-blue-800',
  Packed: 'bg-purple-100 text-purple-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  'Out for Delivery': 'bg-cyan-100 text-cyan-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-gray-100 text-gray-800',
};

const PAYMENT_COLORS: Record<string, string> = {
  done: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  refund_pending: 'bg-amber-100 text-amber-800',
  refund_completed: 'bg-teal-100 text-teal-800',
  rejected: 'bg-red-100 text-red-800',
};

const PAYMENT_LABELS: Record<string, string> = {
  done: 'Done',
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  mode,
  onViewDetails,
  onReject,
  onAccept,
  onUpdateStatus,
  onToggleRefund,
  actionLoading,
}) => {
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null);

  const SHIPMENT_STATUSES = ['Payment Verified', 'Preparation Started', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  if (orders.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="text-5xl mb-4">📦</div>
        <p className="text-foreground/60">
          {mode === 'rejected' ? 'No rejected orders' : 'No orders found'}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-rose-gold/10">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Order ID</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Customer</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Inspo Image</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Nail Size</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Amount</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Payment</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-gold/10">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-rose-gold/5 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-rose-gold whitespace-nowrap">
                  {order.order_number}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{order.customer?.full_name || '—'}</p>
                  <p className="text-xs text-foreground/50">{order.customer?.phone || '—'}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.gallery_product_id
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-pink-100 text-pink-800'
                  }`}>
                    {order.gallery_product_id ? 'Gallery' : 'Custom'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ImagePreview
                    src={order.inspiration_image_url || ''}
                    alt="Inspiration"
                    thumbClassName="w-12 h-12"
                  />
                </td>
                <td className="px-4 py-3">
                  <ImagePreview
                    src={order.nail_size_image_url || ''}
                    alt="Nail Size"
                    thumbClassName="w-12 h-12"
                  />
                </td>
                <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                  ₹{order.total_amount}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    PAYMENT_COLORS[order.payment_status] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {PAYMENT_LABELS[order.payment_status] || order.payment_status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-foreground/60 whitespace-nowrap">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 relative">
                    <button
                      onClick={() => onViewDetails(order)}
                      className="px-3 py-1.5 bg-rose-gold/10 hover:bg-rose-gold/20 text-rose-gold text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                    >
                      View Details
                    </button>
                    {mode === 'active' && onUpdateStatus && (
                      <div className="relative">
                        <button
                          onClick={() => setShowStatusDropdown(showStatusDropdown === order.id ? null : order.id)}
                          className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                        >
                          Shipment
                        </button>
                        {showStatusDropdown === order.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            {SHIPMENT_STATUSES.map((status) => (
                              <button
                                key={status}
                                onClick={() => {
                                  setUpdatingStatus(order.id);
                                  onUpdateStatus(order, status);
                                  setShowStatusDropdown(null);
                                }}
                                disabled={updatingStatus === order.id}
                                className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-100 transition-colors ${
                                  order.status === status ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                {updatingStatus === order.id ? 'Updating...' : status}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {mode === 'active' && onReject && (
                      <button
                        onClick={() => {
                          setRejecting(order.id);
                          onReject(order);
                        }}
                        disabled={rejecting === order.id}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                      >
                        Reject
                      </button>
                    )}
                    {mode === 'rejected' && onAccept && (
                      <button
                        onClick={() => onAccept(order)}
                        className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                      >
                        Accept
                      </button>
                    )}
                    {mode === 'rejected' && onToggleRefund && (
                      <button
                        onClick={() => onToggleRefund(order)}
                        disabled={actionLoading === order.id}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                          order.payment_details?.[0]?.refund_status === 'completed'
                            ? 'bg-teal-100 hover:bg-teal-200 text-teal-700'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                        }`}
                      >
                        {actionLoading === order.id ? 'Updating...' : order.payment_details?.[0]?.refund_status === 'completed' ? 'Refund Done' : 'Refund Pending'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
