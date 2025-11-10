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
        return 'bg-yellow-100 text-yellow-800';
      case 'Requires Completion':
        return 'bg-green-100 text-green-800';
      case 'Pending Delivery Review':
        return 'bg-purple-100 text-purple-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Submission Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Gig Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Title:</span>
                <p className="text-base text-gray-900">{submission.listing.title}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Pay:</span>
                <p className="text-base font-semibold text-indigo-600">
                  {formatCurrency(Number(submission.listing.amount), submission.listing.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Earner Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Earner Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Name:</span>
                <p className="text-base text-gray-900">{submission.earner.name || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Email:</span>
                <p className="text-base text-gray-900">{submission.earner.email}</p>
              </div>
            </div>
          </div>

          {/* Submission Status & Date */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Status & Timeline</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Status:</span>
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
                <span className="text-sm font-medium text-gray-600">Submitted:</span>
                <p className="text-base text-gray-900">
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Application Message */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Message</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{submission.message}</p>
            </div>
          </div>

          {/* Delivery Materials */}
          {submission.deliveryMaterials && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Materials</h3>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{submission.deliveryMaterials}</p>
              </div>
            </div>
          )}

          {!submission.deliveryMaterials && submission.status === 'Requires Completion' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Note:</span> The earner is currently working on this gig. 
                Delivery materials will appear here once they submit their work.
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

