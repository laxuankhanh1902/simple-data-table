import { useMemo } from 'react';
import { Button } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import DataTable from './components/DataTable';
import ErrorBoundary from './components/ErrorBoundary';
import { generateFakeData } from './utils/dataGenerator';
import { useTheme } from './contexts/ThemeContext';
import 'antd/dist/reset.css';
import './App.css';

function App() {
  const { themeMode, toggleTheme } = useTheme();
  
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h1 className="text-xl font-semibold text-white">Kibana-Style Data Table</h1>
          </div>
          <Button
            type="text"
            onClick={toggleTheme}
            icon={themeMode === 'dark' ? <BulbFilled /> : <BulbOutlined />}
            className="text-gray-300 hover:text-white hover:bg-gray-800 border-none"
            title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          />
        </div>
      </div>
      <div className="pt-16">
        <DataTable data={data} />
      </div>
    </ErrorBoundary>
  );
}

export default App
