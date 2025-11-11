'use client';

import { useState } from 'react';

interface Submission {
  id: string;
  listing: {
    title: string;
    amount: number;
    currency: string;
  };
}

interface SubmitDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  submission: Submission | null;
}

export default function SubmitDeliveryModal({
  isOpen,
  onClose,
  onSuccess,
  submission,
}: SubmitDeliveryModalProps) {
  const [deliveryMaterials, setDeliveryMaterials] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!submission) return;

    try {
      const response = await fetch(`/api/submissions/${submission.id}/delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveryMaterials,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit delivery');
        setIsSubmitting(false);
        return;
      }

      // Reset form
      setDeliveryMaterials('');
      
      onSuccess();
      onClose();
    } catch (error) {
      setError('Something went wrong');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDeliveryMaterials('');
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen || !submission) return null;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Submit Delivery</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Job Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{submission.listing.title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(submission.listing.amount, submission.listing.currency)}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="deliveryMaterials" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Delivery Materials *
              </label>
              <textarea
                id="deliveryMaterials"
                required
                value={deliveryMaterials}
                onChange={(e) => setDeliveryMaterials(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                placeholder="Provide links to your completed work, descriptions, or any relevant delivery information...&#10;&#10;Example:&#10;- Dropbox link: https://dropbox.com/...&#10;- Google Drive: https://drive.google.com/...&#10;- Description of what was completed"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Include links to files, portfolios, or describe your completed deliverables.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Delivery'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

