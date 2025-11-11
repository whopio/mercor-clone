'use client';

import { useState, useEffect } from 'react';
import { WhopCheckoutEmbed } from '@whop/checkout/react';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddFundsModal({ isOpen, onClose, onSuccess }: AddFundsModalProps) {
  const [amount, setAmount] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [checkoutConfigId, setCheckoutConfigId] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setAmount('');
    setShowCheckout(false);
    setPlanId(null);
    setCheckoutConfigId(null);
    setError('');
    onClose();
  };

  const handleProceed = async () => {
    const amountNum = parseFloat(amount);
    
    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum < 1) {
      setError('Minimum amount is $1.00');
      return;
    }

    setError('');
    setIsCreatingSession(true);

    try {
      // Create a checkout configuration with Whop API
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountNum,
          currency: 'USD',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create checkout configuration');
        setIsCreatingSession(false);
        return;
      }

      setPlanId(data.planId);
      setCheckoutConfigId(data.checkoutConfigId);
      setShowCheckout(true);
    } catch (error) {
      setError('Something went wrong');
      console.error('Create session error:', error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleCheckoutComplete = (planId: string, receiptId?: string) => {
    console.log('Checkout completed:', planId, receiptId);
    onSuccess();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Funds</h2>
          <button
            onClick={handleClose}
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

        <div className="px-6 py-6">
          {!showCheckout ? (
            <>
              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount to Add (USD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 dark:text-gray-400 text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    id="amount"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 text-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    placeholder="100.00"
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Minimum amount: $1.00
                </p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">How it works:</h3>
                <ul className="text-sm text-indigo-800 dark:text-indigo-400 space-y-1">
                  <li>• Enter the amount you want to add to your balance</li>
                  <li>• Complete the secure checkout process</li>
                  <li>• Funds will be added to your account immediately</li>
                  <li>• Use your balance to pay for completed gigs</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceed}
                  disabled={isCreatingSession}
                  className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingSession ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </div>
            </>
          ) : (
            <div className="min-h-[500px]">
              {planId && checkoutConfigId && (
                <WhopCheckoutEmbed
                  planId={planId}
                  sessionId={checkoutConfigId}
                  onComplete={handleCheckoutComplete}
                  theme="system"
                  fallback={
                    <div className="flex items-center justify-center h-96">
                      <p className="text-gray-600 dark:text-gray-400">Loading checkout...</p>
                    </div>
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

