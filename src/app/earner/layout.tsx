'use client';

import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function EarnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleRoleSwitch = (role: 'earner' | 'recruiter') => {
    if (role === 'recruiter') {
      router.push('/recruiter/my-listings');
    }
  };

  const handleTabChange = (tab: string) => {
    router.push(`/earner/${tab}`);
  };

  return (
    <>
      <Navbar userRole="earner" onRoleSwitch={handleRoleSwitch} />
      
      <main className="pt-16">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => handleTabChange('listings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  pathname === '/earner/listings'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Listings
              </button>
              <button
                onClick={() => handleTabChange('my-submissions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  pathname === '/earner/my-submissions'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Submissions
              </button>
            </div>
          </div>
        </div>

        {children}
      </main>
    </>
  );
}

