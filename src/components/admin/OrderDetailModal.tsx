'use client';

import React from 'react';
import { ImagePreview } from '@/components/admin/ImagePreview';
import type { AdminOrder } from '@/components/admin/OrderTable';
import insforge from '@/lib/insforge';

interface OrderDetailModalProps {
  order: AdminOrder | null;
  onClose: () => void;
}

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-rose-gold/10 last:border-0">
    <span className="sm:w-44 text-xs font-semibold text-foreground/50 uppercase tracking-wide flex-shrink-0">
      {label}
    </span>
    <span className="text-sm text-foreground flex-1">{value || '—'}</span>
  </div>
);

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const [showPayment, setShowPayment] = React.useState(false);
  const [nailShape, setNailShape] = React.useState<{ name: string; description?: string } | null>(null);

  React.useEffect(() => {
    const fetchNailShape = async () => {
      if (order?.nail_shape_id) {
        const { data, error } = await insforge.database
          .from('nail_sizes')
          .select('name, description')
          .eq('id', order.nail_shape_id)
          .limit(1);
        if (!error && data) {
          setNailShape(data[0] as any);
        }
      }
    };
    fetchNailShape();
  }, [order?.nail_shape_id]);

  if (!order) return null;

  const payment = order.payment_details?.[0];
  const isGallery = !!order.gallery_product_id;

  // Parse nail size images - handle both single string and array
  const nailSizeImages = React.useMemo(() => {
    if (order.nail_size_image_url) {
      // Try to parse as JSON array first
      try {
        const parsed = JSON.parse(order.nail_size_image_url);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // If not JSON, treat as single image
        return [order.nail_size_image_url];
      }
    }
    return [];
  }, [order.nail_size_image_url]);

  const canRefund =
    payment?.payment_method === 'razorpay' ||
    payment?.upi_transaction_id ||
    payment?.sender_upi_id;

  return (
    <div
      className="fixed inset-0 z-[900] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-rose-gold/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground">Order Details</h2>
            <p className="text-sm text-rose-gold font-mono">{order.order_number}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-rose-gold/10 rounded-lg transition-colors text-foreground/50 hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Images */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <ImagePreview
                src={order.inspiration_image_url || ''}
                alt="Inspiration"
                thumbClassName="w-20 h-20"
              />
              <span className="text-xs text-foreground/50">Inspiration</span>
            </div>
            {/* Nail Size Images */}
            {nailSizeImages.length > 0 && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex gap-1">
                  {nailSizeImages.map((imageUrl, index) => (
                    <ImagePreview
                      key={index}
                      src={imageUrl}
                      alt={`Nail Size ${index + 1}`}
                      thumbClassName="w-20 h-20"
                    />
                  ))}
                </div>
                <span className="text-xs text-foreground/50">Nail Size</span>
              </div>
            )}
          </div>

          {/* Order Info */}
          <section>
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">Order Information</h3>
            <div className="bg-rose-gold/5 rounded-xl px-4">
              <Row label="Order ID" value={<span className="font-mono text-rose-gold">{order.order_number}</span>} />
              <Row label="Order Type" value={
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isGallery ? 'bg-purple-100 text-purple-800' : 'bg-pink-100 text-pink-800'}`}>
                  {isGallery ? 'Gallery Order' : 'Custom Order'}
                </span>
              } />
              <Row label="Date Ordered" value={formatDate(order.created_at)} />
              <Row label="Amount Paid" value={<span className="font-bold text-rose-gold">₹{order.total_amount}</span>} />
              <Row label="Payment Status" value={order.payment_status} />
              <Row label="Order Status" value={order.status} />
              <Row label="Nail Shape" value={order.nail_shape?.name || order.sizing_notes} />
              <Row label="Customer Address" value={order.shipping_address} />
            </div>
          </section>

          {/* Customer Info */}
          <section>
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">Customer Information</h3>
            <div className="bg-rose-gold/5 rounded-xl px-4">
              <Row label="Full Name" value={order.customer?.full_name} />
              <Row label="Email" value={order.customer?.email} />
              <Row label="Phone" value={order.customer?.phone} />
              <Row label="WhatsApp" value={order.customer?.whatsapp} />
              <Row label="Address" value={order.shipping_address} />
            </div>
          </section>

          {/* Nail Shape & Description */}
          <section>
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">Nail Details</h3>
            <div className="bg-rose-gold/5 rounded-xl px-4">
              {nailShape?.name && <Row label="Nail Shape" value={nailShape.name} />}
              {nailShape?.description && <Row label="Nail Shape Description" value={nailShape.description} />}
              {order.sizing_notes && <Row label="Sizing Notes" value={order.sizing_notes} />}
              {order.design_notes && <Row label="Description" value={order.design_notes} />}
            </div>
          </section>

          {/* Rejection Info */}
          {order.status === 'rejected' && (
            <section className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-700 mb-2 text-sm">Rejection Details</h3>
              <Row label="Rejected At" value={formatDate(order.rejected_at)} />
              {order.rejection_reason && (
                <Row label="Reason" value={order.rejection_reason} />
              )}
            </section>
          )}

          {/* Payment Details Toggle */}
          <section>
            <button
              onClick={() => setShowPayment(!showPayment)}
              className="w-full flex items-center justify-between px-4 py-3 bg-rose-gold/10 hover:bg-rose-gold/20 rounded-xl transition-colors"
            >
              <span className="font-semibold text-foreground text-sm">💳 Payment Information</span>
              <span className="text-foreground/50">{showPayment ? '▲' : '▼'}</span>
            </button>

            {showPayment && (
              <div className="mt-3 bg-rose-gold/5 rounded-xl px-4">
                {payment ? (
                  <>
                    <Row label="Payment Method" value={payment.payment_method || '—'} />
                    <Row label="Payment Gateway ID" value={payment.payment_gateway_id || payment.upi_transaction_id} />
                    <Row label="Gateway Order ID" value={payment.gateway_order_id} />
                    <Row label="Sender Name" value={payment.sender_name} />
                    <Row label="UPI ID" value={payment.sender_upi_id} />
                    <Row label="Transaction ID" value={payment.upi_transaction_id} />
                    <Row label="Amount Paid" value={payment.amount_paid ? `₹${payment.amount_paid}` : undefined} />
                    <Row label="Currency" value="INR" />
                    <Row label="Transaction Date" value={formatDate(payment.payment_date)} />
                    <Row label="Refund Status" value={payment.refund_status || 'none'} />
                    <Row label="Refund Eligible" value={
                      <span className={canRefund ? 'text-green-700 font-semibold' : 'text-foreground/50'}>
                        {canRefund ? '✓ Yes' : 'No payment info available'}
                      </span>
                    } />
                    {payment.notes && <Row label="Notes" value={payment.notes} />}
                    {payment.payment_screenshot_url && (
                      <div className="py-2 border-b border-rose-gold/10 last:border-0 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                        <span className="sm:w-44 text-xs font-semibold text-foreground/50 uppercase tracking-wide flex-shrink-0">
                          Payment Screenshot
                        </span>
                        <ImagePreview
                          src={payment.payment_screenshot_url}
                          alt="Payment Screenshot"
                          thumbClassName="w-24 h-24"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-4 text-sm text-foreground/50 text-center">No payment details available</div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
