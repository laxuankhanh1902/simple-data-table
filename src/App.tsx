import { useMemo } from 'react';
import DataTable from './components/DataTable';
import ErrorBoundary from './components/ErrorBoundary';
import { generateFakeData } from './utils/dataGenerator';
import 'antd/dist/reset.css';
import './App.css';

function App() {
  
  const data = useMemo(() => {
    try {
      return generateFakeData(75);
    } catch (error) {
      console.error('Error generating fake data:', error);
      return [];
    }
  }, []);

  return (
    <ErrorBoundary>
      {/* Professional Kibana-style Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white shadow-lg">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between max-w-full mx-auto">
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">E</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-lg">Enterprise Analytics</span>
                  <span className="text-gray-400 text-xs">Data Intelligence Platform</span>
                </div>
              </div>
              
              {/* Environment Selector */}
              <select className="bg-gray-800 text-white border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none">
                <option>Production Environment</option>
                <option>Staging Environment</option>
                <option>Development Environment</option>
              </select>
            </div>

            {/* Header Right Side */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-md border border-gray-600">
                <span className="text-gray-300 text-sm">Global Search</span>
                <span className="text-gray-500 text-xs bg-gray-700 px-2 py-0.5 rounded">⌘ K</span>
              </div>
              
              {/* User Avatar */}
              <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">AD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Main Content */}
      <div className="min-h-screen bg-gray-900 pt-16">
        <div className="max-w-full mx-auto px-6 py-8">
          <DataTable data={data} />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App
