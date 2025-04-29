export default function NotFound() {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl mb-6">Page Not Found</p>
          <a href="/" className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200">
            Return Home
          </a>
        </div>
      </div>
    );
  }