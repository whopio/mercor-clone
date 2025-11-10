'use client';

import { useState, useEffect } from 'react';
import ApplyModal from '@/components/ApplyModal';

interface Listing {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  duration: string;
  type: string;
  status: string;
  createdAt: string;
  recruiter: {
    id: string;
    name: string | null;
    email: string;
  };
  submissions: any[];
}

export default function ListingsView() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('/api/listings');
        const data = await response.json();
        setListings(data.listings || []);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleApplyClick = (listing: Listing) => {
    setSelectedListing(listing);
    setIsApplyModalOpen(true);
  };

  const handleApplySuccess = () => {
    // Could show a success message or refresh data here
    console.log('Application submitted successfully!');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Loading available gigs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Gigs</h2>
        <p className="text-gray-600">Browse and apply to available opportunities</p>
      </div>

      {listings.length === 0 ? (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No gigs available yet</h3>
          <p className="text-gray-600">Check back soon for new opportunities!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="mb-4">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded">
                  {listing.type}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{listing.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {listing.recruiter.name || listing.recruiter.email}
              </p>
              <p className="text-gray-700 mb-4 line-clamp-3">{listing.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-indigo-600">
                  {formatCurrency(Number(listing.amount), listing.currency)}
                </span>
                <span className="text-sm text-gray-500">{listing.duration}</span>
              </div>
              <button
                onClick={() => handleApplyClick(listing)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      )}

      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setSelectedListing(null);
        }}
        onSuccess={handleApplySuccess}
        listing={selectedListing}
      />
    </div>
  );
}

