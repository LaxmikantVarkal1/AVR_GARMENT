// components/UserProfile.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAtom } from 'jotai';
import { authenticated } from '@/store/atoms';
import { LogOut } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [,setIsAuthenticated] = useAtom(authenticated)

  if (!user) return null;


  return (
    <div className="bg-white p-2 max-w-md mx-auto ">
      <h2 className="text-xs font-bold text-gray-900 mb-4">User Profile</h2>
      
      <div className="space-y-3">
       <div>
          <label className="block text-sm font-medium text-gray-500">Username</label>
          <p className="mt-1 text-sm text-gray-900">{user?.display_name || user.email.split("@")[0]}</p>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-500">Email</label>
          <p className="mt-1 text-sm text-gray-900">{user.email}</p>
        </div>
        
        {/* <div>
          <label className="block text-sm font-medium text-gray-500">User ID</label>
          <p className="mt-1 text-gray-900 font-mono text-xs">{user.id}</p>
        </div> */}
        
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Roles</label>
          <div className="flex flex-wrap gap-2">
            {user.roles.map(role => (
              <span
                key={role}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={()=>{
            logout();
            setIsAuthenticated(false)
        }}
        disabled={loading}
        className="mt-6 flex flex-row gap-2 w-full bg-destructive text-white py-2 px-4 rounded-md hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        <LogOut/>
        {loading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
};


export default UserProfile