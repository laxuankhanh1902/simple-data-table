import React, { useState, useCallback } from 'react';
import { Button, message, Input, Space } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, FilterOutlined, SearchOutlined, CopyOutlined } from '@ant-design/icons';
import type { DataRow, Filter } from '../types';
import { generateFilterLabel } from '../utils/dataUtils';

interface InteractiveJSONProps {
  data: any; // Can be DataRow or cell value
  fieldName?: string; // When showing cell data, this is the field name
  onAddFilter: (filter: Filter) => void;
  onAddColumn: (field: string) => void;
  onRemoveColumn: (field: string) => void;
  existingColumns: string[];
  baseColumns: string[];
}

const InteractiveJSON: React.FC<InteractiveJSONProps> = ({ 
  data, 
  fieldName,
  onAddFilter, 
  onAddColumn, 
  onRemoveColumn, 
  existingColumns,
  baseColumns
}) => {
  // Helper function to generate all possible keys for expansion
  const generateAllKeys = useCallback((obj: any, prefix: string = '', depth: number = 0): string[] => {
    const keys: string[] = [];
    
    if (depth > 10) return keys; // Prevent infinite recursion
    
    if (obj instanceof Map) {
      const mapKey = `map-${prefix}-${depth}`;
      keys.push(mapKey);
      Array.from(obj.entries()).forEach(([k, v], index) => {
        if (v && typeof v === 'object') {
          keys.push(...generateAllKeys(v, `${prefix}[${k}]`, depth + 1));
        }
      });
    } else if (obj instanceof Set) {
      const setKey = `set-${prefix}-${depth}`;
      keys.push(setKey);
    } else if (Array.isArray(obj)) {
      const arrayKey = `array-${prefix}-${depth}`;
      keys.push(arrayKey);
      obj.forEach((item, index) => {
        if (item && typeof item === 'object') {
          keys.push(...generateAllKeys(item, `${prefix}[${index}]`, depth + 1));
        }
      });
    } else if (typeof obj === 'object' && obj !== null) {
      const objKey = `obj-${prefix}-${depth}`;
      keys.push(objKey);
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value && typeof value === 'object') {
          keys.push(...generateAllKeys(value, prefix ? `${prefix}.${key}` : key, depth + 1));
        }
      });
    }
    
    return keys;
  }, []);

  // Initialize with all keys expanded
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    // Convert Maps and Sets for initial expansion calculation
    const processedData = JSON.parse(JSON.stringify(data, (key, value) => {
      if (value instanceof Map) {
        return Object.fromEntries(value);
      }
      if (value instanceof Set) {
        return Array.from(value);
      }
      return value;
    }));
    
    const allKeys = generateAllKeys(processedData);
    return new Set(allKeys);
  });

  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpanded = useCallback((key: string) => {
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const handleCopyValue = useCallback((value: any) => {
    try {
      const textValue = typeof value === 'object' 
        ? JSON.stringify(value, null, 2)
        : String(value);
      navigator.clipboard.writeText(textValue);
      message.success('Value copied to clipboard');
    } catch (error) {
      message.error('Failed to copy value');
    }
  }, []);

  const handleCopyField = useCallback((field: string) => {
    try {
      navigator.clipboard.writeText(field);
      message.success('Field name copied to clipboard');
    } catch (error) {
      message.error('Failed to copy field name');
    }
  }, []);

  const handleQuickFilter = useCallback((field: string, value: any) => {
    try {
      let filterValue = value;
      let operator = 'equals';

      if (value instanceof Map) {
        message.info('Maps require manual filter setup');
        return;
      }
      
      if (value instanceof Set) {
        filterValue = Array.from(value).join(', ');
        operator = 'contains';
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          message.info('Cannot filter on empty arrays');
          return;
        }
        filterValue = value[0];
        operator = 'contains';
      } else if (typeof value === 'object' && value !== null) {
        filterValue = JSON.stringify(value);
        operator = 'contains';
      }

      const filter: Filter = {
        id: `filter_${Date.now()}_${Math.random()}`,
        field,
        value: filterValue,
        operator: operator as any,
        label: generateFilterLabel(field, filterValue, operator),
      };

      onAddFilter(filter);
      message.success(`Filter added: ${filter.label}`);
    } catch (error) {
      console.error('Error creating quick filter:', error);
      message.error('Failed to create filter');
    }
  }, [onAddFilter]);

  const renderColumnButton = useCallback((field: string) => {
    const isColumnAdded = existingColumns.includes(field);
    const isBaseColumn = baseColumns.includes(field);
    const canRemove = isColumnAdded && !isBaseColumn;
    
    return (
      <Button
        size="small"
        type="text"
        icon={isColumnAdded ? <EyeOutlined /> : <EyeInvisibleOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          if (isColumnAdded && !isBaseColumn) {
            onRemoveColumn(field);
          } else if (!isColumnAdded) {
            onAddColumn(field);
          }
        }}
        disabled={isBaseColumn && isColumnAdded}
        style={{ 
          fontSize: '12px', 
          padding: '2px',
          color: isBaseColumn && isColumnAdded ? 'var(--text-tertiary)' : (isColumnAdded ? 'var(--success-color)' : 'var(--text-secondary)'),
          backgroundColor: 'transparent',
          border: 'none',
          width: '20px',
          height: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '6px',
          cursor: isBaseColumn && isColumnAdded ? 'not-allowed' : 'pointer'
        }}
        title={
          isBaseColumn && isColumnAdded 
            ? 'Base column - cannot be hidden' 
            : (isColumnAdded ? 'Hide from table columns' : 'Show in table columns')
        }
      />
    );
  }, [existingColumns, baseColumns, onAddColumn, onRemoveColumn]);

  const renderFilterButton = useCallback((field: string, value: any) => {
    return (
      <Button
        size="small"
        type="text"
        icon={<FilterOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          handleQuickFilter(field, value);
        }}
        style={{ 
          fontSize: '10px', 
          padding: '1px 3px',
          color: 'var(--accent-color)',
          backgroundColor: 'transparent',
          border: 'none',
          minWidth: '16px',
          height: '16px',
          borderRadius: '2px',
          marginLeft: '2px'
        }}
        title={`Filter by ${field}`}
      />
    );
  }, [handleQuickFilter]);

  const renderValue = useCallback((value: any, field: string = '', depth: number = 0): React.ReactNode => {
    const indent = '  '.repeat(depth);
    
    if (value === null || value === undefined) {
      return (
        <span>
          <span style={{ color: 'var(--json-null)' }}>null</span>
          {field && (
            <>
              {renderFilterButton(field, value)}
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyValue(value);
                }}
                style={{ 
                  fontSize: '10px', 
                  padding: '1px 3px',
                  color: '#10b981',
                  backgroundColor: 'transparent',
                  border: 'none',
                  minWidth: '16px',
                  height: '16px',
                  marginLeft: '2px'
                }}
                title="Copy value"
              />
              {renderColumnButton(field)}
            </>
          )}
        </span>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <span>
          <span style={{ color: 'var(--json-boolean)' }}>{String(value)}</span>
          {field && (
            <>
              {renderFilterButton(field, value)}
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyValue(value);
                }}
                style={{ 
                  fontSize: '10px', 
                  padding: '1px 3px',
                  color: '#10b981',
                  backgroundColor: 'transparent',
                  border: 'none',
                  minWidth: '16px',
                  height: '16px',
                  marginLeft: '2px'
                }}
                title="Copy value"
              />
              {renderColumnButton(field)}
            </>
          )}
        </span>
      );
    }

    if (typeof value === 'number') {
      return (
        <span>
          <span style={{ color: 'var(--json-number)' }}>{value}</span>
          {field && (
            <>
              {renderFilterButton(field, value)}
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyValue(value);
                }}
                style={{ 
                  fontSize: '10px', 
                  padding: '1px 3px',
                  color: '#10b981',
                  backgroundColor: 'transparent',
                  border: 'none',
                  minWidth: '16px',
                  height: '16px',
                  marginLeft: '2px'
                }}
                title="Copy value"
              />
              {renderColumnButton(field)}
            </>
          )}
        </span>
      );
    }

    if (typeof value === 'string') {
      return (
        <span>
          <span style={{ color: 'var(--json-string)' }}>"{value}"</span>
          {field && (
            <>
              {renderFilterButton(field, value)}
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyValue(value);
                }}
                style={{ 
                  fontSize: '10px', 
                  padding: '1px 3px',
                  color: '#10b981',
                  backgroundColor: 'transparent',
                  border: 'none',
                  minWidth: '16px',
                  height: '16px',
                  marginLeft: '2px'
                }}
                title="Copy value"
              />
              {renderColumnButton(field)}
            </>
          )}
        </span>
      );
    }

    if (value instanceof Map) {
      const entries = Array.from(value.entries());
      const key = `map-${field}-${depth}`;
      const isExpanded = expandedKeys.has(key);
      
      return (
        <div style={{ display: 'inline-block', width: '100%' }}>
          <span
            style={{ color: 'var(--json-map)', cursor: 'pointer' }}
            onClick={() => toggleExpanded(key)}
          >
            Map({entries.length}) {isExpanded ? '{ ' : '{ ... }'}
          </span>
          {field && (
            <>
              {renderFilterButton(field, value)}
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyValue(value);
                }}
                style={{ 
                  fontSize: '10px', 
                  padding: '1px 3px',
                  color: '#10b981',
                  backgroundColor: 'transparent',
                  border: 'none',
                  minWidth: '16px',
                  height: '16px',
                  marginLeft: '2px'
                }}
                title="Copy value"
              />
              {renderColumnButton(field)}
            </>
          )}
          {isExpanded && (
            <div style={{ marginLeft: '20px' }}>
              {entries.map(([k, v], index) => (
                <div key={index}>
                  <span style={{ color: 'var(--json-key)' }}>"{k}"</span>
                  <span style={{ color: 'var(--json-punctuation)' }}>: </span>
                  {renderValue(v, `${field}[${k}]`, depth + 1)}
                  {index < entries.length - 1 && <span style={{ color: 'var(--json-punctuation)' }}>,</span>}
                </div>
              ))}
            </div>
          )}
          {isExpanded && <span style={{ color: 'var(--json-map)' }}> {'}'}</span>}
        </div>
      );
    }

    if (value instanceof Set) {
      const items = Array.from(value);
      const key = `set-${field}-${depth}`;
      const isExpanded = expandedKeys.has(key);
      
      return (
        <div style={{ display: 'inline-block', width: '100%' }}>
          <span
            style={{ color: 'var(--json-set)', cursor: 'pointer' }}
            onClick={() => toggleExpanded(key)}
          >
            Set({items.length}) {isExpanded ? '[ ' : '[ ... ]'}
          </span>
          {field && (
            <>
              {renderFilterButton(field, value)}
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyValue(value);
                }}
                style={{ 
                  fontSize: '10px', 
                  padding: '1px 3px',
                  color: '#10b981',
                  backgroundColor: 'transparent',
                  border: 'none',
                  minWidth: '16px',
                  height: '16px',
                  marginLeft: '2px'
                }}
                title="Copy value"
              />
              {renderColumnButton(field)}
            </>
          )}
          {isExpanded && (
            <div style={{ marginLeft: '20px' }}>
              {items.map((item, index) => (
                <div key={index}>
                  {renderValue(item, `${field}[${index}]`, depth + 1)}
                  {index < items.length - 1 && <span style={{ color: 'var(--json-punctuation)' }}>,</span>}
                </div>
              ))}
            </div>
          )}
          {isExpanded && <span style={{ color: 'var(--json-set)' }}> ]</span>}
        </div>
      );
    }

    if (Array.isArray(value)) {
      const key = `array-${field}-${depth}`;
      const isExpanded = expandedKeys.has(key);
      
      return (
        <div style={{ display: 'inline-block', width: '100%' }}>
          <span
            style={{ color: 'var(--json-array)', cursor: 'pointer' }}
            onClick={() => toggleExpanded(key)}
          >
            [{value.length}] {isExpanded ? '' : '[ ... ]'}
          </span>
          {field && (
            <>
              {renderFilterButton(field, value)}
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyValue(value);
                }}
                style={{ 
                  fontSize: '10px', 
                  padding: '1px 3px',
                  color: '#10b981',
                  backgroundColor: 'transparent',
                  border: 'none',
                  minWidth: '16px',
                  height: '16px',
                  marginLeft: '2px'
                }}
                title="Copy value"
              />
              {renderColumnButton(field)}
            </>
          )}
          {isExpanded && (
            <div style={{ marginLeft: '20px' }}>
              {value.map((item, index) => (
                <div key={index}>
                  {renderValue(item, `${field}[${index}]`, depth + 1)}
                  {index < value.length - 1 && <span style={{ color: 'var(--json-punctuation)' }}>,</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      const key = `obj-${field}-${depth}`;
      const isExpanded = expandedKeys.has(key);
      
      return (
        <div style={{ display: 'inline-block', width: '100%' }}>
          <span
            style={{ color: 'var(--json-object)', cursor: 'pointer' }}
            onClick={() => toggleExpanded(key)}
          >
            {isExpanded ? '{ ' : '{ ... }'}
          </span>
          {field && (
            <>
              {renderFilterButton(field, value)}
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyValue(value);
                }}
                style={{ 
                  fontSize: '10px', 
                  padding: '1px 3px',
                  color: '#10b981',
                  backgroundColor: 'transparent',
                  border: 'none',
                  minWidth: '16px',
                  height: '16px',
                  marginLeft: '2px'
                }}
                title="Copy value"
              />
              {renderColumnButton(field)}
            </>
          )}
          {isExpanded && (
            <div style={{ marginLeft: '20px' }}>
              {keys.map((k, index) => (
                <div key={k}>
                  <span
                    style={{ 
                      color: 'var(--json-key)', 
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                    onClick={() => handleQuickFilter(field ? `${field}.${k}` : k, value[k])}
                    title="Click to filter by this field"
                  >
                    "{k}"
                  </span>
                  <span style={{ color: 'var(--json-punctuation)' }}>: </span>
                  {renderValue(value[k], field ? `${field}.${k}` : k, depth + 1)}
                  {index < keys.length - 1 && <span style={{ color: 'var(--json-punctuation)' }}>,</span>}
                </div>
              ))}
            </div>
          )}
          {isExpanded && <span style={{ color: 'var(--json-object)' }}> {'}'}</span>}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  }, [expandedKeys, toggleExpanded, handleQuickFilter, renderColumnButton]);

  // Convert Maps and Sets for JSON display
  const processedData = JSON.parse(JSON.stringify(data, (key, value) => {
    if (value instanceof Map) {
      return Object.fromEntries(value);
    }
    if (value instanceof Set) {
      return Array.from(value);
    }
    return value;
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Search and Controls */}
      <div className="mb-4 p-3 bg-gray-750 rounded-lg border border-gray-600">
        <Input
          placeholder="Search records... (e.g., status:active, user.name:John, tags:premium)"
          prefix={<SearchOutlined className="text-gray-400 text-lg mr-1" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
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
        />
        <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
          <span>Click keys to filter • Hover for actions</span>
          <Space>
            <Button 
              size="small" 
              onClick={() => setExpandedKeys(new Set())}
              className="text-gray-400 hover:text-white"
            >
              Collapse All
            </Button>
            <Button 
              size="small" 
              onClick={() => setExpandedKeys(new Set(generateAllKeys(processedData)))}
              className="text-gray-400 hover:text-white"
            >
              Expand All
            </Button>
            <Button 
              size="small" 
              onClick={() => {
                const jsonString = JSON.stringify(processedData, null, 2);
                navigator.clipboard.writeText(jsonString);
                message.success('JSON copied to clipboard');
              }}
              icon={<CopyOutlined />}
              className="text-gray-400 hover:text-white"
            >
              Copy JSON
            </Button>
          </Space>
        </div>
      </div>

      {/* JSON View */}
      <div 
        className="font-mono text-sm p-4 flex-1 overflow-auto rounded-lg border bg-gray-900 text-white"
        style={{ height: 'calc(100vh - 300px)' }}
      >
        {renderValue(processedData, '', 0)}
      </div>
    </div>
  );
};

export default InteractiveJSON;