'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import insforge from '@/lib/insforge';

interface Review {
  id: string;
  name: string;
  rating: number;
  review: string;
  is_approved: boolean;
  created_at: string;
}

export default function AdminReviewsPage() {
  const { isAdmin, authReady } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    if (!isAdmin) {
      window.location.href = '/';
      return;
    }
    fetchReviews();
  }, [authReady, isAdmin]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await insforge.database
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const { error } = await insforge.database
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId);

      if (error) throw error;
      fetchReviews();
    } catch (err) {
      console.error('Error approving review:', err);
      alert('Failed to approve review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    setActionLoading(reviewId);
    try {
      const { error } = await insforge.database
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review');
    } finally {
      setActionLoading(null);
    }
  };

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!authReady || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-baby-pink/20 to-blush-pink/30 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16 text-foreground/50">Loading reviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-baby-pink/20 to-blush-pink/30 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Reviews Management</h1>
            <p className="text-foreground/70">Approve or delete customer reviews</p>
          </div>
          <button
            onClick={fetchReviews}
            className="px-4 py-2 bg-white/80 hover:bg-white rounded-lg text-foreground font-medium transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-16 text-foreground/50">No reviews yet</div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-rose-gold/10"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="font-semibold text-foreground">{review.name}</h3>
                      <StarRating rating={review.rating} />
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        review.is_approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {review.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-foreground/80 leading-relaxed mb-3">
                      "{review.review}"
                    </p>
                    <p className="text-xs text-foreground/50">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!review.is_approved && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={actionLoading === review.id}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === review.id ? 'Approving...' : 'Approve'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={actionLoading === review.id}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === review.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
