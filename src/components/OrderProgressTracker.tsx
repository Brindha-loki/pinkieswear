'use client';

import React from 'react';

export type OrderStatus = 
  | 'Order Placed'
  | 'Payment Verified'
  | 'Preparation Started'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refund Pending'
  | 'Refund Completed';

interface OrderProgressTrackerProps {
  currentStatus: OrderStatus;
  compact?: boolean;
}

const ORDER_STAGES: OrderStatus[] = [
  'Order Placed',
  'Payment Verified',
  'Preparation Started',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const REFUND_STAGES: OrderStatus[] = [
  'Refund Pending',
  'Refund Completed',
];

const getStatusIndex = (status: OrderStatus): number => {
  if (status === 'Cancelled') return -1;
  if (REFUND_STAGES.includes(status)) return 999;
  return ORDER_STAGES.indexOf(status);
};

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'Order Placed':
      return 'bg-blue-500';
    case 'Payment Verified':
      return 'bg-green-500';
    case 'Preparation Started':
      return 'bg-purple-500';
    case 'Packed':
      return 'bg-orange-500';
    case 'Shipped':
      return 'bg-indigo-500';
    case 'Out for Delivery':
      return 'bg-cyan-500';
    case 'Delivered':
      return 'bg-emerald-500';
    case 'Cancelled':
      return 'bg-red-500';
    case 'Refund Pending':
      return 'bg-amber-500';
    case 'Refund Completed':
      return 'bg-teal-500';
    default:
      return 'bg-gray-500';
  }
};

const OrderProgressTracker: React.FC<OrderProgressTrackerProps> = ({ 
  currentStatus, 
  compact = false 
}) => {
  const currentIndex = getStatusIndex(currentStatus);
  const isRefundFlow = currentIndex === 999;
  const isCancelled = currentIndex === -1;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(currentStatus)}`} />
        <span className="text-sm font-medium text-foreground">{currentStatus}</span>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">Order Cancelled</p>
            <p className="text-sm text-foreground/60">This order has been cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  if (isRefundFlow) {
    const refundIndex = REFUND_STAGES.indexOf(currentStatus);
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Refund Status</h3>
        <div className="flex items-center gap-4">
          {REFUND_STAGES.map((stage, index) => {
            const isActive = index <= refundIndex;
            const isCurrent = index === refundIndex;
            return (
              <React.Fragment key={stage}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive ? getStatusColor(stage) : 'bg-gray-300'
                    }`}
                  >
                    {isActive && (
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-2 text-center ${
                      isCurrent ? 'font-semibold text-foreground' : 'text-foreground/60'
                    }`}
                  >
                    {stage}
                  </p>
                </div>
                {index < REFUND_STAGES.length - 1 && (
                  <div
                    className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                      index < refundIndex ? getStatusColor(currentStatus) : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-semibold text-foreground mb-4">Order Progress</h3>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {ORDER_STAGES.map((stage, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center min-w-[80px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive ? getStatusColor(stage) : 'bg-gray-300'
                  } ${isCurrent ? 'ring-4 ring-rose-gold/30' : ''}`}
                >
                  {isActive ? (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-gray-500 text-sm">{index + 1}</span>
                  )}
                </div>
                <p
                  className={`text-xs mt-2 text-center leading-tight ${
                    isCurrent ? 'font-semibold text-foreground' : 'text-foreground/60'
                  }`}
                >
                  {stage}
                </p>
              </div>
              {index < ORDER_STAGES.length - 1 && (
                <div
                  className={`w-12 h-1 rounded-full transition-all duration-300 ${
                    index < currentIndex ? getStatusColor(currentStatus) : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgressTracker;
