'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { WhopElementsOptions } from "@whop/embedded-components-vanilla-js/types";
import {
  Elements,
  PayoutsSession,
  BalanceElement,
  WithdrawButtonElement,
} from "@whop/embedded-components-react-js";
import { loadWhopElements } from "@whop/embedded-components-vanilla-js";

const elements = loadWhopElements();

const appearance: WhopElementsOptions["appearance"] = {
  classes: {
    ".Button": { height: "40px", "border-radius": "8px" },
    ".Button:disabled": { "background-color": "gray" },
    ".Container": { "border-radius": "12px" }
  },
};

interface WhopCompany {
  id: string;
  title: string;
  whopId: string;
  createdAt: string;
}

interface PayoutStatus {
  hasCompany: boolean;
  company: WhopCompany | null;
}

interface PayoutsViewProps {
  payoutStatus: PayoutStatus;
}

export default function PayoutsView({ payoutStatus }: PayoutsViewProps) {
  const router = useRouter();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [error, setError] = useState('');

  const fetchPayoutToken = async () => {
    const response = await fetch('/api/payouts/status');
    const data = await response.json();
    
    return data.token as string;
  };

  const handleSetupPayouts = async () => {
    setIsSettingUp(true);
    setError('');

    try {
      const response = await fetch('/api/payouts/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to setup payouts');
        setIsSettingUp(false);
        return;
      }

      // Refresh the page to get updated status
      router.refresh();
    } catch (error) {
      setError('Something went wrong');
      console.error('Setup payouts error:', error);
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Payouts</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your earnings and payout settings</p>
      </div>

      {!payoutStatus?.hasCompany ? (
        // Setup flow
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Setup Your Payout Account
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                To receive payments for completed gigs, you need to set up your payout account. 
                This will create a secure merchant account powered by Whop.
              </p>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">What happens next:</h4>
                <ul className="text-sm text-indigo-800 dark:text-indigo-400 space-y-2">
                  <li>• We&apos;ll create a secure payout account for you</li>
                  <li>• Your earnings from completed gigs will be tracked</li>
                  <li>• You&apos;ll be able to withdraw funds according to the platform terms</li>
                  <li>• All transactions are secured by Whop&apos;s payment infrastructure</li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleSetupPayouts}
              disabled={isSettingUp}
              className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSettingUp ? 'Setting up...' : 'Setup Payouts'}
            </button>
          </div>
        </div>
      ) : (
        // Payout account active - placeholder for Whop payouts component
        <div className="space-y-6">
          {/* Account Status Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mr-4">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Payout Account Active
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {payoutStatus.company?.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Account ID: {payoutStatus.company?.whopId}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Active
              </span>
            </div>
          </div>

          {/* Whop Payouts Component */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Balance & Withdrawals
            </h3>
            <Elements appearance={appearance} elements={elements}>
                <PayoutsSession token={fetchPayoutToken} currency="USD">
                  <div className="space-y-3">
                    <div>
                      <BalanceElement fallback={<div className="text-gray-600 dark:text-gray-400">Loading balance...</div>} />
                    </div>
                    <div className="h-[40px]">
                      <WithdrawButtonElement fallback={<div className="text-gray-600 dark:text-gray-400">Loading...</div>} />
                    </div>
                  </div>
                </PayoutsSession>
              </Elements>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 shrink-0"
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
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  How Payouts Work
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  When a recruiter marks your submission as complete, your earnings will be tracked 
                  in your payout account. Funds can be withdrawn according to the platform&apos;s payout schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

