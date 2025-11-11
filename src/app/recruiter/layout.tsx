'use client';

import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleRoleSwitch = (role: 'earner' | 'recruiter') => {
    if (role === 'earner') {
      router.push('/earner/listings');
    }
  };

  const handleTabChange = (tab: string) => {
    router.push(`/recruiter/${tab}`);
  };

  return (
    <>
      <Navbar userRole="recruiter" onRoleSwitch={handleRoleSwitch} />
      
      <main className="pt-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => handleTabChange('my-listings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  pathname === '/recruiter/my-listings'
                    ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                My Listings
              </button>
              <button
                onClick={() => handleTabChange('submissions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  pathname === '/recruiter/submissions'
                    ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Submissions
              </button>
              <button
                onClick={() => handleTabChange('balance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  pathname === '/recruiter/balance'
                    ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Balance
              </button>
            </div>
          </div>
        </div>

        {children}
      </main>
    </>
  );
}

