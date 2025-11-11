'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface NavbarProps {
  userRole: 'earner' | 'recruiter';
  onRoleSwitch: (role: 'earner' | 'recruiter') => void;
}

export default function Navbar({ userRole, onRoleSwitch }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Mercor Clone</h1>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                {/* Role Switcher */}
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => onRoleSwitch('earner')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      userRole === 'earner'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    Earner
                  </button>
                  <button
                    onClick={() => onRoleSwitch('recruiter')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      userRole === 'recruiter'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    Recruiter
                  </button>
                </div>

                <span className="text-sm text-gray-700 dark:text-gray-300">{session.user?.name}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

