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
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Completed' }),
      });

      if (!response.ok) {
        console.error('Failed to mark as complete');
        return;
      }

      // Refresh submissions
      fetchSubmissions();
    } catch (error) {
      console.error('Error marking as complete:', error);
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
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(submissionId)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Reject
            </button>
          </div>
        );
      case 'Requires Completion':
        return (
          <span className="text-sm text-gray-500">Awaiting Delivery</span>
        );
      case 'Pending Delivery Review':
        return (
          <button
            onClick={() => handleMarkComplete(submissionId)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Mark Complete & Pay
          </button>
        );
      case 'Completed':
        return (
          <span className="text-sm text-gray-500">Paid</span>
        );
      case 'Rejected':
        return (
          <span className="text-sm text-gray-500">Rejected</span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Submissions</h2>
        <p className="text-gray-600">Review and manage applications to your job postings</p>
      </div>

      {submissions.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gig
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{submission.listing.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {submission.earner.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">{submission.earner.email}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">
                      {formatCurrency(Number(submission.listing.amount), submission.listing.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2 items-center">
                        <button 
                          onClick={() => handleViewDetails(submission)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
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
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-600">Applications to your job postings will appear here</p>
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

