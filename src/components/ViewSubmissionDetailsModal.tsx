'use client';

import { useEffect } from 'react';

interface Submission {
  id: string;
  message: string;
  deliveryMaterials: string | null;
  status: string;
  submittedAt: string;
  listing: {
    id: string;
    title: string;
    amount: number;
    currency: string;
  };
  earner: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ViewSubmissionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
}

export default function ViewSubmissionDetailsModal({
  isOpen,
  onClose,
  submission,
}: ViewSubmissionDetailsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !submission) return null;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Acceptance':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'Requires Completion':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'Pending Delivery Review':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
      case 'Completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'Rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Submission Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Gig Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Gig Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Title:</span>
                <p className="text-base text-gray-900 dark:text-gray-100">{submission.listing.title}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pay:</span>
                <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(Number(submission.listing.amount), submission.listing.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Earner Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Earner Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name:</span>
                <p className="text-base text-gray-900 dark:text-gray-100">{submission.earner.name || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</span>
                <p className="text-base text-gray-900 dark:text-gray-100">{submission.earner.email}</p>
              </div>
            </div>
          </div>

          {/* Submission Status & Date */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Status & Timeline</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2.5 py-1 text-xs font-semibold rounded ${getStatusColor(
                      submission.status
                    )}`}
                  >
                    {submission.status}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted:</span>
                <p className="text-base text-gray-900 dark:text-gray-100">
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Application Message */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Application Message</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{submission.message}</p>
            </div>
          </div>

          {/* Delivery Materials */}
          {submission.deliveryMaterials && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Delivery Materials</h3>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{submission.deliveryMaterials}</p>
              </div>
            </div>
          )}

          {!submission.deliveryMaterials && submission.status === 'Requires Completion' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <span className="font-semibold">Note:</span> The earner is currently working on this gig. 
                Delivery materials will appear here once they submit their work.
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 dark:bg-gray-500 hover:bg-gray-700 dark:hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

