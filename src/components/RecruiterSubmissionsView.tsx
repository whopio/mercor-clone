'use client';

export default function RecruiterSubmissionsView() {
  // Sample submissions for recruiter to review
  const submissions = [
    {
      id: 1,
      gigTitle: 'Social Media Content Creation',
      earnerName: 'Sarah Johnson',
      earnerEmail: 'sarah.j@example.com',
      submittedDate: '2025-11-08',
      status: 'Pending Review',
      pay: '$500',
      portfolioLink: 'https://portfolio.example.com',
    },
    {
      id: 2,
      gigTitle: 'Social Media Content Creation',
      earnerName: 'Mike Chen',
      earnerEmail: 'mike.c@example.com',
      submittedDate: '2025-11-07',
      status: 'Pending Review',
      pay: '$500',
      portfolioLink: 'https://portfolio.example.com',
    },
    {
      id: 3,
      gigTitle: 'Product Photography',
      earnerName: 'Emily Davis',
      earnerEmail: 'emily.d@example.com',
      submittedDate: '2025-11-06',
      status: 'Approved',
      pay: '$800',
      portfolioLink: 'https://portfolio.example.com',
    },
    {
      id: 4,
      gigTitle: 'Product Photography',
      earnerName: 'Alex Martinez',
      earnerEmail: 'alex.m@example.com',
      submittedDate: '2025-11-09',
      status: 'Completed',
      pay: '$800',
      portfolioLink: 'https://portfolio.example.com',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionButton = (status: string, submissionId: number) => {
    switch (status) {
      case 'Pending Review':
        return (
          <div className="flex gap-2">
            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
              Approve
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
              Reject
            </button>
          </div>
        );
      case 'Approved':
        return (
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
            Mark Complete & Pay
          </button>
        );
      case 'Completed':
        return (
          <span className="text-sm text-gray-500">Paid</span>
        );
      default:
        return null;
    }
  };

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
                      <div className="text-sm font-medium text-gray-900">{submission.gigTitle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{submission.earnerName}</div>
                      <div className="text-sm text-gray-500">{submission.earnerEmail}</div>
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
                      {new Date(submission.submittedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">
                      {submission.pay}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2 items-center">
                        <button className="text-indigo-600 hover:text-indigo-900 font-medium">
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
    </div>
  );
}

