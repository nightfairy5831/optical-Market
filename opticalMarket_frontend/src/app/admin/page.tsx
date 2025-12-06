'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.name} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a
              href="#"
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Users
            </a>
            <a
              href="#"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Products
            </a>
            <a
              href="#"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Orders
            </a>
            <a
              href="#"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Categories
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">R$ 0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="px-4 py-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-left">
              <div className="font-medium">Approve Sellers</div>
              <div className="text-sm text-blue-600">Manage seller approvals</div>
            </button>
            <button className="px-4 py-3 bg-green-50 text-green-700 rounded-md hover:bg-green-100 text-left">
              <div className="font-medium">Manage Products</div>
              <div className="text-sm text-green-600">View and moderate products</div>
            </button>
            <button className="px-4 py-3 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 text-left">
              <div className="font-medium">View Orders</div>
              <div className="text-sm text-purple-600">Monitor all orders</div>
            </button>
          </div>
        </div>

        {/* Info Message */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Milestone 1:</strong> Admin panel structure created. Full functionality will be implemented in subsequent milestones.
          </p>
        </div>
      </main>
    </div>
  );
}
