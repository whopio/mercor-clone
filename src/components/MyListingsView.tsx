'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import CreateListingModal from '@/components/CreateListingModal';
import EditListingModal from '@/components/EditListingModal';

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
  submissions: any[];
}

export default function MyListingsView() {
  const { data: session } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchListings = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/listings?userId=${session.user.id}`);
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchListings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleCreateSuccess = () => {
    fetchListings();
  };

  const handleEditClick = (listing: Listing) => {
    setSelectedListing(listing);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchListings();
    setSelectedListing(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Filled':
        return 'bg-blue-100 text-blue-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h2>
          <p className="text-gray-600">Manage your job postings</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          + Create New Listing
        </button>
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-600 mb-4">Create your first job posting to get started</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{listing.title}</h3>
                  <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded ${getStatusColor(listing.status)}`}>
                    {listing.status}
                  </span>
                  <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded">
                    {listing.type}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{listing.description}</p>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span className="font-semibold text-indigo-600 text-base">{formatCurrency(Number(listing.amount), listing.currency)}</span>
                  <span>{listing.duration}</span>
                  <span>{listing.submissions?.length || 0} applicants</span>
                  <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => handleEditClick(listing)}
                  className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                >
                  Edit
                </button>
                <button className="text-gray-600 hover:text-gray-900 font-medium text-sm">
                  View Applications
                </button>
                <button className="text-red-600 hover:text-red-900 font-medium text-sm">
                  Close Listing
                </button>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditListingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedListing(null);
        }}
        onSuccess={handleEditSuccess}
        listing={selectedListing}
      />
    </div>
  );
}

