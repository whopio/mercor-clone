'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [paymentId, setPaymentId] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/connect-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentId.trim(),
          recruiterEmail: recruiterEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to connect payment');
        setIsSubmitting(false);
        return;
      }

      setSuccess(data);
      setPaymentId('');
      setRecruiterEmail('');
    } catch (error) {
      setError('Something went wrong');
      console.error('Connect payment error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Logged in as: {session?.user?.email}
              </p>
            </div>
            <button
              onClick={() => router.push('/earner/listings')}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium text-sm"
            >
              ← Back to App
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Manually Connect Payment to Recruiter
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Connect a Whop payment to a specific recruiter account
            </p>
          </div>

          <div className="p-6">
            {/* Warning Banner */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                    Admin Tool - Use with Caution
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    This will retrieve a payment from Whop and manually assign it to a recruiter. 
                    Only works for payments that don't already exist in the database.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment ID Field */}
              <div>
                <label htmlFor="paymentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Whop Payment ID
                </label>
                <input
                  type="text"
                  id="paymentId"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  placeholder="pay_xxxxxxxxxxxxx"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono text-sm"
                  required
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  The Whop payment ID (starts with "pay_")
                </p>
              </div>

              {/* Recruiter Email Field */}
              <div>
                <label htmlFor="recruiterEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recruiter Email Address
                </label>
                <input
                  type="email"
                  id="recruiterEmail"
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                  placeholder="recruiter@example.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  required
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  The email address of the recruiter to credit this payment to
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                  <div className="flex">
                    <svg
                      className="w-5 h-5 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
                        Payment Connected Successfully
                      </h4>
                      <dl className="text-sm text-green-800 dark:text-green-400 space-y-1">
                        <div className="flex">
                          <dt className="font-medium w-32">Payment ID:</dt>
                          <dd className="font-mono">{success.payment.id}</dd>
                        </div>
                        <div className="flex">
                          <dt className="font-medium w-32">Amount:</dt>
                          <dd>{success.payment.currency} {success.payment.amount}</dd>
                        </div>
                        <div className="flex">
                          <dt className="font-medium w-32">Status:</dt>
                          <dd className="capitalize">{success.payment.status}</dd>
                        </div>
                        <div className="flex">
                          <dt className="font-medium w-32">Recruiter:</dt>
                          <dd>{success.payment.recruiterEmail}</dd>
                        </div>
                        {success.ledgerEntry && (
                          <div className="flex">
                            <dt className="font-medium w-32">Ledger Entry:</dt>
                            <dd>Created ({success.ledgerEntry.currency} {success.ledgerEntry.amount})</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Connecting Payment...' : 'Connect Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                How This Works
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• The system retrieves the payment details from Whop's API</li>
                <li>• It validates that the payment doesn't already exist in the database</li>
                <li>• The payment is created and assigned to the specified recruiter</li>
                <li>• If the payment is successful, a ledger entry (credit) is automatically created</li>
                <li>• The recruiter's balance will be updated accordingly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

