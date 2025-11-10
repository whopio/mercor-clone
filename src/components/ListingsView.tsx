'use client';

export default function ListingsView() {
  // Sample job listings data
  const listings = [
    {
      id: 1,
      title: 'Social Media Content Creation',
      company: 'TechCorp Inc.',
      description: 'Create engaging social media content for our brand across Instagram, Twitter, and LinkedIn.',
      pay: '$500',
      duration: '1 week',
      type: 'Remote',
    },
    {
      id: 2,
      title: 'Product Photography',
      company: 'Fashion Forward',
      description: 'Professional product photography for our new clothing line. Must include editing.',
      pay: '$800',
      duration: '3 days',
      type: 'On-site',
    },
    {
      id: 3,
      title: 'Blog Writing - Tech Reviews',
      company: 'Digital Insights',
      description: 'Write comprehensive tech product reviews for our blog. 5 articles needed.',
      pay: '$400',
      duration: '2 weeks',
      type: 'Remote',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Gigs</h2>
        <p className="text-gray-600">Browse and apply to available opportunities</p>
      </div>

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
            <p className="text-sm text-gray-600 mb-4">{listing.company}</p>
            <p className="text-gray-700 mb-4 line-clamp-3">{listing.description}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-indigo-600">{listing.pay}</span>
              <span className="text-sm text-gray-500">{listing.duration}</span>
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors">
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

