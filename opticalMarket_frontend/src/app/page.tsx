'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Request from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [blingStatus, setBlingStatus] = useState<any>(null);
  const [blingLoading, setBlingLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (!user) {
      router.push('/login');
    } else if (user.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [user, loading, router]);

  const checkBlingStatus = async () => {
    setBlingLoading(true);
    try {
      const data = await Request.Get('/bling/status');
      setBlingStatus(data);
    } catch (error: any) {
      setBlingStatus({ error: error.message || 'Failed to check Bling status' });
    } finally {
      setBlingLoading(false);
    }
  };

  const syncProducts = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    try {
      const data = await Request.Get('/bling/sync/products');
      setSyncResult({ success: true, data });
    } catch (error: any) {
      setSyncResult({ success: false, error: error.message || 'Failed to sync products' });
    } finally {
      setSyncLoading(false);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-full border-2 border-gray-300 overflow-hidden">
              <Image
                src="/assets/user.png"
                alt="User Avatar"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-semibold text-gray-900">{user.name}</span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Optical Market
          </h1>
          <p className="text-xl text-gray-600">
            Hello, {user.name}! You are logged in as <span className="font-semibold">{user.role}</span>
          </p>
        </div>

        {/* ERP Test Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Bling ERP Integration Test
          </h2>

          {/* API Connection Status */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold text-lg mb-4">1. API Connection Status</h3>
            <button
              onClick={checkBlingStatus}
              disabled={blingLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {blingLoading ? 'Checking...' : 'Check Connection'}
            </button>
            {blingStatus && (
              <div className={`p-4 rounded-lg ${blingStatus.error ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'}`}>
                {blingStatus.error ? (
                  <p className="text-red-700">{blingStatus.error}</p>
                ) : (
                  <>
                    <p className={`font-medium text-lg ${blingStatus.configured ? 'text-green-700' : 'text-orange-700'}`}>
                      Status: {blingStatus.configured ? 'Connected ✓' : 'Not Configured'}
                    </p>
                    <p className="text-gray-700 mt-1">{blingStatus.message}</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Product Sync */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold text-lg mb-4">2. Sync Products</h3>
            <button
              onClick={syncProducts}
              disabled={syncLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {syncLoading ? 'Syncing...' : 'Sync Products'}
            </button>

            {syncResult && (
              <div className="mt-4">
                {syncResult.success ? (
                  <div>
                    <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg mb-4">
                      <p className="font-medium text-green-700 text-lg">Sync Completed ✓</p>
                      <p className="text-gray-700 mt-1">{syncResult.data.message}</p>
                    </div>

                    {/* Product Table */}
                    {syncResult.data.data && syncResult.data.data.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-4 py-2 text-left">SKU</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {syncResult.data.data.map((product: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2">{product.sku}</td>
                                <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                                <td className="border border-gray-300 px-4 py-2">${product.price}</td>
                                <td className="border border-gray-300 px-4 py-2">{product.stock}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
                    <p className="text-red-700">{syncResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
