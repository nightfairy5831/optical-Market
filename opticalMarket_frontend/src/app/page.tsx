import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Optical Market
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your optical marketplace platform
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-lg"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-md hover:bg-blue-50 font-medium text-lg"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Milestone 1: Foundation & Infrastructure ✓</p>
        </div>
      </div>
    </main>
  );
}
