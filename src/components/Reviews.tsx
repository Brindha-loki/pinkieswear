'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Section, SectionHeader } from './ui/Section';
import { useAuth } from '../lib/AuthContext';
import insforge from '../lib/insforge';

interface Review {
  id: string;
  name: string;
  rating: number;
  review: string;
  created_at: string;
}

const StarRating = ({ rating, interactive = false, onRatingChange }: { rating: number; interactive?: boolean; onRatingChange?: (rating: number) => void }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={i < rating ? 'text-yellow-400 cursor-pointer' : 'text-gray-300 cursor-pointer'}
          onClick={() => interactive && onRatingChange && onRatingChange(i + 1)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const Reviews = () => {
  const { user, authReady } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    review: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await insforge.database
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const { error } = await insforge.database
        .from('reviews')
        .insert({
          name: formData.name,
          rating: formData.rating,
          review: formData.review,
          is_approved: false // Requires admin approval
        });

      if (error) throw error;

      setSubmitSuccess(true);
      setFormData({ name: '', rating: 5, review: '' });
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      alert(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Section id="reviews" className="bg-gradient-to-b from-baby-pink/20 to-white/30">
      <SectionHeader
        title="Customer Reviews"
        subtitle="See what our lovely customers have to say about their Pinkie Swear experience"
      />

      {loading ? (
        <div className="text-center py-12 text-foreground/50">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-foreground/50">
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {reviews.map((review) => (
            <Card key={review.id} hover className="group">
              <CardHeader>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-4xl">👩</div>
                  <div>
                    <h3 className="font-semibold text-foreground">{review.name}</h3>
                    <StarRating rating={review.rating} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 leading-relaxed italic">
                  "{review.review}"
                </p>
                <p className="text-xs text-foreground/50 mt-3">{formatDate(review.created_at)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="text-center mt-12">
        <p className="text-foreground/70 mb-4">Share your experience with us</p>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-rose-gold to-blush-pink text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          Leave a Review
        </button>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[900] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-rose-gold/10 px-6 py-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-foreground">Leave a Review</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-rose-gold/10 rounded-lg transition-colors text-foreground/50 hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="font-semibold text-foreground mb-2">Review Submitted!</h3>
                  <p className="text-foreground/70">Thank you for your feedback. Your review will be visible after admin approval.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Your Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full border border-rose-gold/20 bg-white/90 px-4 py-3 rounded-xl text-foreground outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                    <StarRating
                      rating={formData.rating}
                      interactive
                      onRatingChange={(rating) => setFormData({ ...formData, rating })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Your Review</label>
                    <textarea
                      value={formData.review}
                      onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                      required
                      rows={4}
                      className="w-full border border-rose-gold/20 bg-white/90 px-4 py-3 rounded-xl text-foreground outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 resize-none"
                      placeholder="Share your experience with Pinkie Swear..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-gradient-to-r from-rose-gold to-blush-pink text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

export default Reviews;
