'use client';

import { useState, useEffect } from 'react';
import ViewSubmissionDetailsModal from '@/components/ViewSubmissionDetailsModal';

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

export default function RecruiterSubmissionsView() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions/recruiter');
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Acceptance':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'Requires Completion':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'Pending Delivery Review':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'Completed':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'Rejected':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Requires Completion' }),
      });

      if (!response.ok) {
        console.error('Failed to approve submission');
        return;
      }

      // Refresh submissions
      fetchSubmissions();
    } catch (error) {
      console.error('Error approving submission:', error);
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Rejected' }),
      });

      if (!response.ok) {
        console.error('Failed to reject submission');
        return;
      }

      // Refresh submissions
      fetchSubmissions();
    } catch (error) {
      console.error('Error rejecting submission:', error);
    }
  };

  const handleMarkComplete = async (submissionId: string) => {
    // Confirm action
    if (!confirm('Are you sure you want to mark this submission as complete and process the payment? This action will debit your account balance and transfer funds to the earner.')) {
      return;
    }

    try {
      const response = await fetch(`/api/submissions/${submissionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.error || 'Failed to complete submission'}`);
        return;
      }

      alert(`Success! Payment of ${formatCurrency(data.transfer.amount, data.transfer.currency)} has been sent to the earner. Platform fee: ${formatCurrency(data.transfer.platformFee, data.transfer.currency)}`);

      // Refresh submissions
      fetchSubmissions();
    } catch (error) {
      console.error('Error marking as complete:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsDetailsModalOpen(true);
  };

  const getActionButton = (status: string, submissionId: string) => {
    switch (status) {
      case 'Pending Acceptance':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(submissionId)}
              className="bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(submissionId)}
              className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Reject
            </button>
          </div>
        );
      case 'Requires Completion':
        return (
          <span className="text-sm text-gray-500 dark:text-gray-400">Awaiting Delivery</span>
        );
      case 'Pending Delivery Review':
        return (
          <button
            onClick={() => handleMarkComplete(submissionId)}
            className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Mark Complete & Pay
          </button>
        );
      case 'Completed':
        return (
          <span className="text-sm text-gray-500 dark:text-gray-400">Paid</span>
        );
      case 'Rejected':
        return (
          <span className="text-sm text-gray-500 dark:text-gray-400">Rejected</span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 dark:text-gray-400">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Submissions</h2>
        <p className="text-gray-600 dark:text-gray-400">Review and manage applications to your job postings</p>
      </div>

      {submissions.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Gig
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Earner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{submission.listing.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {submission.earner.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{submission.earner.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold rounded ${getStatusColor(
                          submission.status
                        )}`}
                      >
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(Number(submission.listing.amount), submission.listing.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2 items-center">
                        <button 
                          onClick={() => handleViewDetails(submission)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium"
                        >
                          View Details
                        </button>
                        {getActionButton(submission.status, submission.id)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No submissions yet</h3>
          <p className="text-gray-600 dark:text-gray-400">Applications to your job postings will appear here</p>
        </div>
      )}

      <ViewSubmissionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedSubmission(null);
        }}
        submission={selectedSubmission}
      />
    </div>
  );
}

