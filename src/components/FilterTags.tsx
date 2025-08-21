import React from 'react';
import { Tag, Space, Typography } from 'antd';
import type { Filter, ColumnConfig } from '../types';

const { Text } = Typography;

interface FilterTagsProps {
  filters: Filter[];
  onRemove: (index: number) => void;
  additionalColumns: ColumnConfig[];
  onRemoveColumn: (field: string) => void;
}

const FilterTags: React.FC<FilterTagsProps> = ({ 
  filters, 
  onRemove, 
  additionalColumns, 
  onRemoveColumn 
}) => {
  if (filters.length === 0 && additionalColumns.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      {filters.length > 0 && (
        <div className={additionalColumns.length > 0 ? 'mb-4' : ''}>
          <div className="flex items-center gap-2 mb-3">
            <Text className="text-sm text-gray-300 font-medium">Active Filters:</Text>
            <div className="h-4 w-px bg-gray-600"></div>
            <Text className="text-xs text-gray-500">{filters.length} filter{filters.length !== 1 ? 's' : ''}</Text>
          </div>
          <Space size={[6, 6]} wrap>
            {filters.map((filter, index) => (
              <Tag
                key={`${filter.field}-${index}`}
                closable
                onClose={() => onRemove(index)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500 hover:from-blue-700 hover:to-blue-800 rounded-md px-3 py-1 text-sm font-medium shadow-sm transition-all duration-200"
              >
                {filter.label}
              </Tag>
            ))}
          </Space>
        </div>
      )}
      
      {additionalColumns.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Text className="text-sm text-gray-300 font-medium">Custom Columns:</Text>
            <div className="h-4 w-px bg-gray-600"></div>
            <Text className="text-xs text-gray-500">{additionalColumns.length} column{additionalColumns.length !== 1 ? 's' : ''}</Text>
          </div>
          <Space size={[6, 6]} wrap>
            {additionalColumns.map((column) => (
              <Tag
                key={column.key}
                closable
                onClose={() => onRemoveColumn(column.key)}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-500 hover:from-emerald-700 hover:to-emerald-800 rounded-md px-3 py-1 text-sm font-medium shadow-sm transition-all duration-200"
              >
                {column.title}
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
};

export default FilterTags;