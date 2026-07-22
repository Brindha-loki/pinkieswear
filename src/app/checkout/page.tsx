'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import insforge from '@/lib/insforge';
import { uploadImageToStorage, uploadGalleryImageAsInspiration } from '@/lib/storageHelper';


export default function CheckoutPage() {
  const { cart, clearCart, cartSubtotal, cartTotal, deliveryCharge } = useCart();
  const { user, userId } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UPI payment details form state
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderUpiId, setSenderUpiId] = useState('');
  const [upiTransactionId, setUpiTransactionId] = useState('');

  const resolveNailShapeId = async (shapeName?: string) => {
    if (!shapeName) return null;

    const { data, error } = await insforge.database
      .from('nail_sizes')
      .select('id')
      .ilike('name', shapeName)
      .limit(1);

    if (error) {
      console.warn('[Checkout] Failed to resolve nail shape ID:', error);
      return null;
    }

    return Array.isArray(data) && data.length > 0 ? data[0].id : null;
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const createOrdersAfterPayment = async (paymentId: string, orderId: string) => {
    try {
      // Get customer data
      const { data: customerList, error: customerError } = await insforge.database
        .from('customers')
        .select('*')
        .eq('auth_id', userId);

      if (customerError) {
        console.error('[Checkout] Customer fetch error:', customerError);
        throw new Error('Customer data not found');
      }

      const customerData = Array.isArray(customerList) ? customerList[0] : customerList;
      if (!customerData) {
        throw new Error('No customer record found');
      }

      console.log('[Checkout] Creating orders for payment:', { paymentId, orderId });

      // Create order for each cart item
      for (const item of cart) {
        const nailShapeId = await resolveNailShapeId(item.nailShape);
        const orderPayload = {
          customer_id: customerData.id,
          gallery_product_id: null,
          status: 'Order Placed',
          payment_status: 'pending',
          total_amount: item.price,
          shipping_address: item.shippingAddress || customerData.full_name || '',
          design_notes: item.designNotes || null,
          nail_shape_id: nailShapeId,
          sizing_notes: item.sizingNotes || null,
          quantity: 1,
        };

        console.log('[Checkout] Order payload:', orderPayload);

        const { data: orderList, error: orderError } = await insforge.database
          .from('orders')
          .insert([orderPayload])
          .select();

        if (orderError) {
          console.error('[Checkout] Order insert error:', JSON.stringify(orderError));
          throw new Error(`Failed to create order: ${JSON.stringify(orderError)}`);
        }

        const orderData = Array.isArray(orderList) ? orderList[0] : orderList;
        if (!orderData?.id) {
          throw new Error('Failed to retrieve order ID after creation');
        }

        const orderNumber = orderData.order_number;
        console.log('[Checkout] Order created:', { orderId: orderData.id, orderNumber });

        // Update order with images
        let updatePayload: any = {};

        // Upload inspiration image if exists
        if (item.inspirationImage) {
          try {
            const imageUrl = item.inspirationImage.startsWith('http')
              ? await uploadGalleryImageAsInspiration(item.inspirationImage, orderNumber)
              : await uploadImageToStorage(item.inspirationImage, orderNumber, 'inspiration-images');
            updatePayload.inspiration_image_url = imageUrl;
            console.log('[Checkout] Inspiration image uploaded:', { orderNumber, url: imageUrl });
          } catch (uploadError) {
            console.warn('[Checkout] Inspiration image upload error:', uploadError);
          }
        }

        // Upload nail photo (nail size image) if exists
        // Note: item.image might be from gallery product, so check if it's a data URL (uploaded)
        // For checkout from cart items that came from custom order flow, the nail photo would be in the item
        if (item.nailSizeImage || (item.image && item.image.startsWith('data:'))) {
          try {
            const photoToUpload = item.nailSizeImage || item.image;
            const imageUrl = await uploadImageToStorage(
              photoToUpload,
              orderNumber,
              'nail-size-images'
            );
            updatePayload.nail_size_image_url = imageUrl;
            console.log('[Checkout] Nail size image uploaded:', { orderNumber, url: imageUrl });
          } catch (uploadError) {
            console.warn('[Checkout] Nail size image upload error:', uploadError);
          }
        }

        // Update order with image URLs
        if (Object.keys(updatePayload).length > 0) {
          const { error: updateError } = await insforge.database
            .from('orders')
            .update(updatePayload)
            .eq('id', orderData.id);

          if (updateError) {
            console.warn('[Checkout] Failed to update order with image URLs:', updateError);
          }
        }

        // Create payment details with full Razorpay info
        const { error: paymentError } = await insforge.database
          .from('payment_details')
          .insert({
            order_id: orderData.id,
            payment_screenshot_url: null,
            sender_name: customerData.full_name || '',
            sender_upi_id: null,
            upi_transaction_id: paymentId,
            payment_gateway_id: paymentId,
            gateway_order_id: orderId,
            payment_method: 'razorpay',
            amount_paid: item.price,
            payment_date: new Date().toISOString(),
            refund_status: 'none',
          });

        if (paymentError) {
          console.warn('[Checkout] Payment detail creation error:', paymentError);
        }
      }

      console.log('[Checkout] All orders created successfully');
      // Clear cart and redirect to orders
      clearCart();
      router.push('/my-orders');
    } catch (err: any) {
      console.error('[Checkout] Order creation error:', err);
      const errorMessage = err?.message || JSON.stringify(err) || 'Unknown error';
      setError(`Failed to create order: ${errorMessage}`);
      setLoading(false);
    }
  };

  const handleUPIPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !userId) {
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!paymentScreenshot || !senderName || !senderUpiId || !upiTransactionId) {
      setError('Please fill all payment details');
      return;
    }

    setLoading(true);

    try {
      // Get customer data
      const { data: customerList, error: customerError } = await insforge.database
        .from('customers')
        .select('*')
        .eq('auth_id', userId);

      if (customerError) {
        console.error('[Checkout] Customer fetch error:', customerError);
        throw new Error('Customer data not found');
      }

      const customerData = Array.isArray(customerList) ? customerList[0] : customerList;
      if (!customerData) {
        throw new Error('No customer record found');
      }

      console.log('[Checkout] Creating UPI orders');

      // Calculate total amount (nail price + delivery charge)
      const totalAmount = cartTotal;

      // Create order for each cart item
      for (const item of cart) {
        const nailShapeId = await resolveNailShapeId(item.nailShape);
        const orderPayload = {
          customer_id: customerData.id,
          gallery_product_id: null,
          status: 'Order Placed',
          payment_status: 'pending',
          total_amount: totalAmount,
          shipping_address: item.shippingAddress || customerData.full_name || '',
          design_notes: item.designNotes || null,
          nail_shape_id: nailShapeId,
          sizing_notes: item.sizingNotes || null,
          quantity: 1,
        };

        console.log('[Checkout] UPI Order payload:', orderPayload);

        const { data: orderList, error: orderError } = await insforge.database
          .from('orders')
          .insert([orderPayload])
          .select();

        if (orderError) {
          console.error('[Checkout] Order insert error:', JSON.stringify(orderError));
          throw new Error(`Failed to create order: ${JSON.stringify(orderError)}`);
        }

        const orderData = Array.isArray(orderList) ? orderList[0] : orderList;
        if (!orderData?.id) {
          throw new Error('Failed to retrieve order ID after creation');
        }

        const orderNumber = orderData.order_number;
        console.log('[Checkout] UPI Order created:', { orderId: orderData.id, orderNumber });

        // Update order with images
        let updatePayload: any = {};

        // Upload inspiration image if exists
        if (item.inspirationImage) {
          try {
            const imageUrl = item.inspirationImage.startsWith('http')
              ? await uploadGalleryImageAsInspiration(item.inspirationImage, orderNumber)
              : await uploadImageToStorage(item.inspirationImage, orderNumber, 'inspiration-images');
            updatePayload.inspiration_image_url = imageUrl;
            console.log('[Checkout] Inspiration image uploaded:', { orderNumber, url: imageUrl });
          } catch (uploadError) {
            console.warn('[Checkout] Inspiration image upload error:', uploadError);
          }
        }

        // Upload nail photo (nail size image) if exists
        if (item.nailSizeImage || (item.image && item.image.startsWith('data:'))) {
          try {
            const photoToUpload = item.nailSizeImage || item.image;
            const imageUrl = await uploadImageToStorage(
              photoToUpload,
              orderNumber,
              'nail-size-images'
            );
            updatePayload.nail_size_image_url = imageUrl;
            console.log('[Checkout] Nail size image uploaded:', { orderNumber, url: imageUrl });
          } catch (uploadError) {
            console.warn('[Checkout] Nail size image upload error:', uploadError);
          }
        }

        // Update order with image URLs
        if (Object.keys(updatePayload).length > 0) {
          const { error: updateError } = await insforge.database
            .from('orders')
            .update(updatePayload)
            .eq('id', orderData.id);

          if (updateError) {
            console.warn('[Checkout] Failed to update order with image URLs:', updateError);
          }
        }

        // Create payment details for UPI with full info
        const { error: paymentError } = await insforge.database
          .from('payment_details')
          .insert({
            order_id: orderData.id,
            payment_screenshot_url: paymentScreenshot,
            sender_name: senderName,
            sender_upi_id: senderUpiId,
            upi_transaction_id: upiTransactionId,
            payment_gateway_id: upiTransactionId,
            payment_method: 'upi',
            amount_paid: totalAmount,
            payment_date: new Date().toISOString(),
            refund_status: 'none',
          });

        if (paymentError) {
          console.warn('[Checkout] Payment detail creation error:', paymentError);
        }
      }

      console.log('[Checkout] All UPI orders created successfully');
      // Clear cart and redirect to orders
      clearCart();
      router.push('/my-orders');
    } catch (err: any) {
      console.error('[Checkout] UPI checkout error:', err);
      const errorMessage = err?.message || JSON.stringify(err) || 'Unknown error';
      setError(`Failed to create order: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Please login to checkout</p>
          <button
            onClick={() => router.push('/login')}
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Checkout 💖
            </h1>
            <p className="text-foreground/70 text-lg">
              Complete your order by providing payment details
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                Order Summary
              </h2>

              <div className="bg-rose-gold/10 rounded-xl p-4 mb-6">
                <p className="text-sm text-foreground/80 flex items-center gap-2">
                  <svg className="w-5 h-5 text-rose-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Shipping typically takes 10-20 days</span>
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center pb-4 border-b border-rose-gold/10">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-baby-pink to-blush-pink">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">💅</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-foreground/70">₹{item.price}</p>
                      {item.nailShape && (
                        <p className="text-xs text-foreground/50">Shape: {item.nailShape}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-rose-gold/20">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Subtotal</span>
                  <span className="text-foreground">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Delivery</span>
                  <span className="text-foreground">₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-rose-gold/20">
                  <span className="text-foreground">Total</span>
                  <span className="text-rose-gold">₹{cartTotal}</span>
                </div>
              </div>
            </div>

            {/* Payment Details Form */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                Payment Details
              </h2>

              <div className="bg-rose-gold/10 rounded-xl p-4 mb-6">
                <p className="text-sm text-foreground/80 mb-2">
                  <strong>Payment Method:</strong>
                </p>
                <p className="text-sm text-foreground/60">
                  UPI Transfer (Manual Payment)
                </p>
              </div>
                <form onSubmit={handleUPIPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Payment Screenshot *
                  </label>
                  <div className="border-2 border-dashed border-rose-gold/30 rounded-xl p-6 text-center hover:border-rose-gold transition-colors relative">
                    {paymentScreenshot ? (
                      <div className="relative">
                        <img
                          src={paymentScreenshot}
                          alt="Payment screenshot"
                          className="w-full h-48 object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setPaymentScreenshot(null)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="cursor-pointer" onClick={() => document.getElementById('screenshot-input')?.click()}>
                        <svg className="w-12 h-12 mx-auto text-rose-gold/50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a6 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-foreground/60">Click to upload payment screenshot</p>
                      </div>
                    )}
                    <input
                      id="screenshot-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sender Name *
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-rose-gold/20 bg-white/90 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none"
                    placeholder="Name on UPI account"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sender UPI ID *
                  </label>
                  <input
                    type="text"
                    value={senderUpiId}
                    onChange={(e) => setSenderUpiId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-rose-gold/20 bg-white/90 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none"
                    placeholder="yourname@upi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    UPI Transaction ID *
                  </label>
                  <input
                    type="text"
                    value={upiTransactionId}
                    onChange={(e) => setUpiTransactionId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-rose-gold/20 bg-white/90 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none"
                    placeholder="Transaction ID from payment app"
                    required
                  />
                </div>

                <div className="bg-rose-gold/10 rounded-xl p-4 mb-4">
                  <p className="text-sm text-foreground/80 mb-2">
                    <strong>Payment Instructions:</strong>
                  </p>
                  <p className="text-sm text-foreground/60 mb-4">
                    Please transfer ₹{cartTotal} to our UPI ID: <strong>snehakushi7@ybl</strong>
                  </p>
                  <div className="flex justify-center mb-4">
                    <img src="/phonepe-qr.png" alt="PhonePe QR Code" className="w-48 h-48 object-contain" />
                  </div>
                  <p className="text-xs text-foreground/50 text-center">
                    Scan QR code using PhonePe or any UPI app
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-rose-gold to-blush-pink text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
                </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
