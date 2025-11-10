'use client';

export default function MyListingsView() {
  // Sample listings posted by the recruiter
  const myListings = [
    {
      id: 1,
      title: 'Social Media Content Creation',
      description: 'Create engaging social media content for our brand across Instagram, Twitter, and LinkedIn.',
      pay: '$500',
      duration: '1 week',
      type: 'Remote',
      status: 'Active',
      applicants: 12,
      postedDate: '2025-11-05',
    },
    {
      id: 2,
      title: 'Product Photography',
      description: 'Professional product photography for our new clothing line. Must include editing.',
      pay: '$800',
      duration: '3 days',
      type: 'On-site',
      status: 'Active',
      applicants: 8,
      postedDate: '2025-11-08',
    },
    {
      id: 3,
      title: 'Video Editing Project',
      description: 'Edit promotional videos for our marketing campaign. 5 videos total.',
      pay: '$600',
      duration: '1 week',
      type: 'Remote',
      status: 'Filled',
      applicants: 15,
      postedDate: '2025-11-01',
    },
  ];

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h2>
          <p className="text-gray-600">Manage your job postings</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          + Create New Listing
        </button>
      </div>

      <div className="space-y-4">
        {myListings.map((listing) => (
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
                  <span className="font-semibold text-indigo-600 text-base">{listing.pay}</span>
                  <span>{listing.duration}</span>
                  <span>{listing.applicants} applicants</span>
                  <span>Posted {new Date(listing.postedDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">
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
    </div>
  );
}

