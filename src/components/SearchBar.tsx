import React, { useState, useCallback } from 'react';
import { Input, Button, Space, Typography, Tag } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  totalRecords?: number;
  filteredRecords?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search records... (e.g., status:active, user.name:John, tags:premium)"
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(() => {
    onSearch(searchQuery.trim());
  }, [searchQuery, onSearch]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    onSearch('');
  }, [onSearch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <div className="relative w-full">
      {/* Professional Search Input */}
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Search records... (e.g., status:active, user.name:John, tags:premium)"
        prefix={
          <SearchOutlined className="text-gray-400 text-lg mr-1" />
        }
        className="enterprise-search"
        style={{ 
          height: '40px',
          borderRadius: '8px',
          fontSize: '14px',
          backgroundColor: '#1f2937',
          border: 'none',
          color: '#e5e7eb',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out'
        }}
        suffix={
          searchQuery && (
            <Button
              type="text"
              icon={<ClearOutlined />}
              onClick={handleClear}
              size="small"
              className="text-gray-400 hover:text-gray-300 hover:bg-gray-700 w-7 h-7 flex items-center justify-center rounded transition-colors duration-150"
            />
          )
        }
      />
    </div>
  );
};

export default SearchBar;