'use client';

import { useState } from 'react';

interface Listing {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  recruiter: {
    name: string | null;
    email: string;
  };
}

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  listing: Listing | null;
}

export default function ApplyModal({ isOpen, onClose, onSuccess, listing }: ApplyModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!listing) return;

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit application');
        setIsSubmitting(false);
        return;
      }

      // Reset form
      setMessage('');
      
      onSuccess();
      onClose();
    } catch (error) {
      setError('Something went wrong');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen || !listing) return null;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Apply for Gig</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Listing Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-semibold text-indigo-600">
                {formatCurrency(listing.amount, listing.currency)}
              </span>
              <span>Posted by {listing.recruiter.name || listing.recruiter.email}</span>
            </div>
            <p className="text-sm text-gray-700 mt-3 line-clamp-2">{listing.description}</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Why should you be accepted for this gig? *
              </label>
              <textarea
                id="message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tell the recruiter about your relevant experience, skills, and why you're the best fit for this opportunity..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Tip: Include relevant experience, portfolio links, and your availability.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

