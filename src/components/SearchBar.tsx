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
    <div className="w-full">
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        prefix={<SearchOutlined className="text-gray-400" />}
        className="text-white placeholder-gray-400"
        style={{ 
          borderRadius: '8px',
          padding: '8px 12px',
          boxShadow: 'none'
        }}
        suffix={
          <Space>
            {searchQuery && (
              <Button
                type="text"
                icon={<ClearOutlined />}
                onClick={handleClear}
                size="small"
                className="text-gray-400 hover:text-white"
              />
            )}
          </Space>
        }
      />
    </div>
  );
};

export default SearchBar;