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
    <div style={{ 
      marginBottom: '16px', 
      padding: '12px', 
      backgroundColor: 'var(--bg-secondary)', 
      borderRadius: '6px',
      border: '1px solid var(--border-color)'
    }}>
      {filters.length > 0 && (
        <div style={{ marginBottom: additionalColumns.length > 0 ? '12px' : 0 }}>
          <Text strong style={{ marginRight: '8px', color: 'var(--text-primary)' }}>
            Active Filters:
          </Text>
          <Space size={[0, 8]} wrap>
            {filters.map((filter, index) => (
              <Tag
                key={`${filter.field}-${index}`}
                closable
                onClose={() => onRemove(index)}
                color="blue"
                style={{ 
                  margin: '2px',
                  backgroundColor: 'var(--accent-color)',
                  borderColor: 'var(--accent-color)',
                  color: 'white',
                  fontWeight: '500'
                }}
              >
                {filter.label}
              </Tag>
            ))}
          </Space>
        </div>
      )}
      
      {additionalColumns.length > 0 && (
        <div>
          <Text strong style={{ marginRight: '8px', color: 'var(--text-primary)' }}>
            Custom Columns:
          </Text>
          <Space size={[0, 8]} wrap>
            {additionalColumns.map((column) => (
              <Tag
                key={column.key}
                closable
                onClose={() => onRemoveColumn(column.key)}
                color="green"
                style={{ 
                  margin: '2px',
                  backgroundColor: 'var(--success-color)',
                  borderColor: 'var(--success-color)',
                  color: 'white',
                  fontWeight: '500'
                }}
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