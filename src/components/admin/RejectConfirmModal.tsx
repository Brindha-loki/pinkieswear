'use client';

import React, { useState } from 'react';

interface RejectConfirmModalProps {
  orderNumber: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const RejectConfirmModal: React.FC<RejectConfirmModalProps> = ({
  orderNumber,
  onConfirm,
  onCancel,
  loading,
}) => {
  const [reason, setReason] = useState('');

  return (
    <div
      className="fixed inset-0 z-[950] bg-black/60 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="font-serif text-xl font-bold text-foreground mb-2">Reject this order?</h2>
          <p className="text-sm text-foreground/60">
            Order <span className="font-mono text-rose-gold font-semibold">{orderNumber}</span> will be moved to Rejected Orders.
          </p>
          <p className="text-xs text-foreground/50 mt-1">No data will be deleted. The customer will see a rejection notice.</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Rejection Reason <span className="text-foreground/40 font-normal">(optional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Payment verification failed, item out of stock..."
            className="w-full px-4 py-3 rounded-xl border border-rose-gold/20 bg-rose-gold/5 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none resize-none text-sm"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-rose-gold/20 text-foreground rounded-xl font-medium hover:bg-rose-gold/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};
