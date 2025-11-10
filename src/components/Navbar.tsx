'use client';

interface NavbarProps {
  userRole: 'earner' | 'recruiter';
  onRoleSwitch: (role: 'earner' | 'recruiter') => void;
}

export default function Navbar({ userRole, onRoleSwitch }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-indigo-600">Swift Gig</h1>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Role Switcher */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onRoleSwitch('earner')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  userRole === 'earner'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Earner
              </button>
              <button
                onClick={() => onRoleSwitch('recruiter')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  userRole === 'recruiter'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Recruiter
              </button>
            </div>

            <button className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              Sign In
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

