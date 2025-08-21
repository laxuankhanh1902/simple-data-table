import React, { useState, useCallback, useMemo } from 'react';
import { 
  Card, Button, Space, Typography, Tag, Input, message, 
  Tooltip, Divider, Badge, Row, Col, Flex
} from 'antd';
import { 
  PlusOutlined, MinusOutlined, FilterOutlined, CopyOutlined, 
  SearchOutlined, EyeOutlined, BookOutlined, NumberOutlined,
  CalendarOutlined, LinkOutlined, FileTextOutlined, DownOutlined, RightOutlined
} from '@ant-design/icons';
import type { DataRow, Filter } from '../types';
import { flattenObject, generateFilterLabel } from '../utils/dataUtils';

const { Text, Title, Paragraph } = Typography;
const { Search } = Input;

interface EnhancedDetailPanelProps {
  data: any;
  fieldName?: string;
  onAddFilter: (filter: Filter) => void;
  onAddColumn: (field: string) => void;
  onRemoveColumn: (field: string) => void;
  existingColumns: string[];
  baseColumns: string[];
}

const EnhancedDetailPanel: React.FC<EnhancedDetailPanelProps> = ({ 
  data, 
  fieldName,
  onAddFilter, 
  onAddColumn, 
  onRemoveColumn,
  existingColumns,
  baseColumns
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const flattenedData = useMemo(() => {
    if (!data) return {};
    
    const isSimpleValue = !data || typeof data !== 'object' || data instanceof Date;
    
    if (isSimpleValue) {
      const displayName = fieldName || 'value';
      return { [displayName]: data };
    }
    
    try {
      const flattened = flattenObject(data);
      return Object.keys(flattened).length === 0 
        ? { [fieldName || 'value']: data }
        : flattened;
    } catch (error) {
      console.error('Error flattening data:', error);
      return { error: 'Failed to process data' };
    }
  }, [data, fieldName]);

  const filteredFields = useMemo(() => {
    if (!searchQuery) return Object.entries(flattenedData);
    
    return Object.entries(flattenedData).filter(([key, value]) => 
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [flattenedData, searchQuery]);

  const getFieldType = (value: any): { type: string; icon: React.ReactNode; color: string } => {
    if (value === null || value === undefined) {
      return { type: 'null', icon: <FileTextOutlined />, color: '#8c8c8c' };
    }
    if (typeof value === 'boolean') {
      return { type: 'boolean', icon: <EyeOutlined />, color: value ? '#52c41a' : '#ff4d4f' };
    }
    if (typeof value === 'number') {
      return { type: 'number', icon: <NumberOutlined />, color: '#1890ff' };
    }
    if (typeof value === 'string') {
      if (value.includes('http://') || value.includes('https://')) {
        return { type: 'url', icon: <LinkOutlined />, color: '#722ed1' };
      }
      if (value.includes('@')) {
        return { type: 'email', icon: <FileTextOutlined />, color: '#eb2f96' };
      }
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        return { type: 'date', icon: <CalendarOutlined />, color: '#fa8c16' };
      }
      return { type: 'string', icon: <FileTextOutlined />, color: '#52c41a' };
    }
    if (value instanceof Date) {
      return { type: 'date', icon: <CalendarOutlined />, color: '#fa8c16' };
    }
    if (value instanceof Map) {
      return { type: 'map', icon: <BookOutlined />, color: '#13c2c2' };
    }
    if (value instanceof Set) {
      return { type: 'set', icon: <BookOutlined />, color: '#2f54eb' };
    }
    if (Array.isArray(value)) {
      return { type: 'array', icon: <BookOutlined />, color: '#722ed1' };
    }
    if (typeof value === 'object') {
      return { type: 'object', icon: <BookOutlined />, color: '#fa541c' };
    }
    return { type: 'unknown', icon: <FileTextOutlined />, color: '#8c8c8c' };
  };

  const handleAddFilter = useCallback((field: string, value: any) => {
    try {
      let filterValue = value;
      let operator = 'equals';

      if (value instanceof Map || value instanceof Set) {
        message.info('Complex data types require manual filter setup');
        return;
      }
      
      if (Array.isArray(value)) {
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
      console.error('Error creating filter:', error);
      message.error('Failed to create filter');
    }
  }, [onAddFilter]);

  const handleAddColumn = useCallback((field: string) => {
    if (existingColumns.includes(field)) {
      message.warning('Column already exists');
      return;
    }
    onAddColumn(field);
    message.success(`Column "${field}" added`);
  }, [existingColumns, onAddColumn]);

  const handleRemoveColumn = useCallback((field: string) => {
    if (baseColumns.includes(field)) {
      message.warning('Cannot remove base column');
      return;
    }
    onRemoveColumn(field);
    message.success(`Column "${field}" removed`);
  }, [baseColumns, onRemoveColumn]);

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

  const toggleExpanded = useCallback((fieldPath: string) => {
    setExpandedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldPath)) {
        newSet.delete(fieldPath);
      } else {
        newSet.add(fieldPath);
      }
      return newSet;
    });
  }, []);

  const renderValue = (value: any): React.ReactNode => {
    const { type } = getFieldType(value);
    
    if (value === null || value === undefined) {
      return <Text type="secondary" italic>null</Text>;
    }

    if (typeof value === 'boolean') {
      return (
        <Tag color={value ? 'success' : 'error'}>
          {value ? 'true' : 'false'}
        </Tag>
      );
    }

    if (typeof value === 'number') {
      return (
        <Text strong className="font-mono">
          {value.toLocaleString()}
        </Text>
      );
    }

    if (typeof value === 'string') {
      if (value.includes('http://') || value.includes('https://')) {
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
            {value.length > 50 ? `${value.substring(0, 50)}...` : value}
          </a>
        );
      }
      if (value.includes('@')) {
        return <Text code className="text-purple-600">{value}</Text>;
      }
      return <Text className="break-words">{value}</Text>;
    }

    if (value instanceof Date) {
      return (
        <Text className="font-mono text-orange-600">
          {value.toLocaleString()}
        </Text>
      );
    }

    if (value instanceof Map) {
      const entries = Array.from(value.entries());
      return (
        <div className="space-y-2">
          <Badge count={entries.length} className="mr-2">
            <Text strong className="text-cyan-600">Map</Text>
          </Badge>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {entries.slice(0, 5).map(([key, val], index) => (
              <div key={index} className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded border-l-2 border-cyan-400">
                <Text strong>{String(key)}:</Text> {renderValue(val)}
              </div>
            ))}
            {entries.length > 5 && (
              <Text type="secondary" className="text-xs">
                ... and {entries.length - 5} more entries
              </Text>
            )}
          </div>
        </div>
      );
    }

    if (value instanceof Set) {
      const items = Array.from(value);
      return (
        <div className="space-y-2">
          <Badge count={items.length} className="mr-2">
            <Text strong className="text-blue-600">Set</Text>
          </Badge>
          <Space size={[0, 4]} wrap>
            {items.slice(0, 8).map((item, index) => (
              <Tag key={index} color="blue" className="text-xs">
                {String(item)}
              </Tag>
            ))}
            {items.length > 8 && (
              <Tag color="default" className="text-xs">
                +{items.length - 8} more
              </Tag>
            )}
          </Space>
        </div>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <Text type="secondary" italic>Empty Array</Text>;
      }
      
      return (
        <div className="space-y-2">
          <Badge count={value.length} className="mr-2">
            <Text strong className="text-purple-600">Array</Text>
          </Badge>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {value.slice(0, 3).map((item, index) => (
              <div key={index} className="text-xs bg-purple-50 dark:bg-purple-900/20 p-2 rounded border-l-2 border-purple-400">
                <Text strong>[{index}]:</Text> {renderValue(item)}
              </div>
            ))}
            {value.length > 3 && (
              <Text type="secondary" className="text-xs">
                ... and {value.length - 3} more items
              </Text>
            )}
          </div>
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return <Text type="secondary" italic>Empty Object</Text>;
      }
      
      return (
        <div className="space-y-2">
          <Badge count={keys.length} className="mr-2">
            <Text strong className="text-orange-600">Object</Text>
          </Badge>
          <div className="max-h-32 overflow-y-auto">
            <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded border font-mono overflow-x-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    return <Text>{String(value)}</Text>;
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <EyeOutlined className="text-4xl mb-4" />
          <p>No data selected</p>
          <p className="text-sm">Select a row to view its details</p>
        </div>
      </div>
    );
  }

  // Helper function to render data in tree-like format with expand/collapse and actions
  const renderTreeValue = (key: string, value: any, level: number = 0, parentPath: string = ''): React.ReactNode => {
    const indent = level * 24;
    const { icon, color } = getFieldType(value);
    const fieldPath = parentPath ? `${parentPath}.${key}` : key;
    const isExpanded = expandedFields.has(fieldPath);
    const isColumnAdded = existingColumns.includes(fieldPath);
    const isBaseColumn = baseColumns.includes(fieldPath);
    
    // Filter by search query
    if (searchQuery && !key.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !String(value).toLowerCase().includes(searchQuery.toLowerCase())) {
      return null;
    }
    
    const renderActions = () => (
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-200">
        <Tooltip title="Add filter">
          <Button
            type="text"
            size="small"
            icon={<FilterOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleAddFilter(fieldPath, value);
            }}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 w-6 h-6"
          />
        </Tooltip>
        
        <Tooltip title="Copy value">
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleCopyValue(value);
            }}
            className="text-green-400 hover:text-green-300 hover:bg-green-900/20 w-6 h-6"
          />
        </Tooltip>
        
        <Tooltip title={isColumnAdded ? 'Remove from table' : 'Add to table'}>
          <Button
            type="text"
            size="small"
            icon={isColumnAdded ? <MinusOutlined /> : <PlusOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              if (isColumnAdded && !isBaseColumn) {
                handleRemoveColumn(fieldPath);
              } else if (!isColumnAdded) {
                handleAddColumn(fieldPath);
              }
            }}
            disabled={isBaseColumn && isColumnAdded}
            className={
              isBaseColumn && isColumnAdded 
                ? 'text-gray-600 w-6 h-6' 
                : (isColumnAdded ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20 w-6 h-6' : 'text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 w-6 h-6')
            }
          />
        </Tooltip>
      </div>
    );
    
    if (value === null || value === undefined) {
      return (
        <div style={{ paddingLeft: indent }} className="flex items-center justify-between py-1 group hover:bg-gray-800/50 rounded px-2 -mx-2">
          <div className="flex items-center">
            <span className="text-gray-300 font-medium mr-3 cursor-pointer" onClick={() => handleCopyField(fieldPath)}>{key}</span>
            <span className="text-gray-500 italic">null</span>
            {isColumnAdded && <Tag color="success" size="small" className="ml-2">In Table</Tag>}
          </div>
          {renderActions()}
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <div style={{ paddingLeft: indent }} className="flex items-center justify-between py-1 group hover:bg-gray-800/50 rounded px-2 -mx-2">
          <div className="flex items-center">
            <span className="text-gray-300 font-medium mr-3 cursor-pointer" onClick={() => handleCopyField(fieldPath)}>{key}</span>
            <span className={value ? 'text-green-400' : 'text-red-400'}>{value ? 'true' : 'false'}</span>
            {isColumnAdded && <Tag color="success" size="small" className="ml-2">In Table</Tag>}
          </div>
          {renderActions()}
        </div>
      );
    }

    if (typeof value === 'number') {
      return (
        <div style={{ paddingLeft: indent }} className="flex items-center justify-between py-1 group hover:bg-gray-800/50 rounded px-2 -mx-2">
          <div className="flex items-center">
            <span className="text-gray-300 font-medium mr-3 cursor-pointer" onClick={() => handleCopyField(fieldPath)}>{key}</span>
            <span className="text-blue-400 font-mono">{value.toLocaleString()}</span>
            {isColumnAdded && <Tag color="success" size="small" className="ml-2">In Table</Tag>}
          </div>
          {renderActions()}
        </div>
      );
    }

    if (typeof value === 'string') {
      const truncatedValue = value.length > 60 ? `${value.substring(0, 60)}...` : value;
      
      return (
        <div style={{ paddingLeft: indent }} className="flex items-center justify-between py-1 group hover:bg-gray-800/50 rounded px-2 -mx-2">
          <div className="flex items-center min-w-0 flex-1">
            <span className="text-gray-300 font-medium mr-3 cursor-pointer flex-shrink-0" onClick={() => handleCopyField(fieldPath)}>{key}</span>
            <span className="text-green-400 break-words truncate">{truncatedValue}</span>
            {isColumnAdded && <Tag color="success" size="small" className="ml-2 flex-shrink-0">In Table</Tag>}
          </div>
          {renderActions()}
        </div>
      );
    }

    if (value instanceof Date) {
      return (
        <div style={{ paddingLeft: indent }} className="flex items-center justify-between py-1 group hover:bg-gray-800/50 rounded px-2 -mx-2">
          <div className="flex items-center">
            <span className="text-gray-300 font-medium mr-3 cursor-pointer" onClick={() => handleCopyField(fieldPath)}>{key}</span>
            <span className="text-orange-400 font-mono">{value.toISOString()}</span>
            {isColumnAdded && <Tag color="success" size="small" className="ml-2">In Table</Tag>}
          </div>
          {renderActions()}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div>
          <div style={{ paddingLeft: indent }} className="flex items-center justify-between py-1 group hover:bg-gray-800/50 rounded px-2 -mx-2">
            <div className="flex items-center flex-1">
              <span className="text-gray-300 font-medium mr-3 cursor-pointer" onClick={() => handleCopyField(fieldPath)}>{key}</span>
              <span className="text-purple-400">[{value.length} items]</span>
              {isColumnAdded && <Tag color="success" size="small" className="ml-2">In Table</Tag>}
            </div>
            <div className="flex items-center gap-1">
              {renderActions()}
              <Button
                type="text"
                size="small"
                icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                onClick={() => toggleExpanded(fieldPath)}
                className="text-gray-400 hover:text-gray-300 w-4 h-4 flex-shrink-0 ml-1"
              />
            </div>
          </div>
          {isExpanded && (
            <div>
              {value.slice(0, 20).map((item, index) => (
                <div key={index}>
                  {renderTreeValue(index.toString(), item, level + 1, fieldPath)}
                </div>
              ))}
              {value.length > 20 && (
                <div style={{ paddingLeft: indent + 24 }} className="text-gray-500 py-1 text-sm">
                  ... {value.length - 20} more items (collapse and expand to see more)
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return (
          <div style={{ paddingLeft: indent }} className="flex items-center justify-between py-1 group hover:bg-gray-800/50 rounded px-2 -mx-2">
            <div className="flex items-center">
              <span className="text-gray-300 font-medium mr-3 cursor-pointer" onClick={() => handleCopyField(fieldPath)}>{key}</span>
              <span className="text-gray-500 italic">{'{}'}</span>
              {isColumnAdded && <Tag color="success" size="small" className="ml-2">In Table</Tag>}
            </div>
            {renderActions()}
          </div>
        );
      }

      return (
        <div>
          <div style={{ paddingLeft: indent }} className="flex items-center justify-between py-1 group hover:bg-gray-800/50 rounded px-2 -mx-2">
            <div className="flex items-center flex-1">
              <span className="text-gray-300 font-medium mr-3 cursor-pointer" onClick={() => handleCopyField(fieldPath)}>{key}</span>
              <span className="text-orange-400">{'{'}{keys.length} fields{'}'}</span>
              {isColumnAdded && <Tag color="success" size="small" className="ml-2">In Table</Tag>}
            </div>
            <div className="flex items-center gap-1">
              {renderActions()}
              <Button
                type="text"
                size="small"
                icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                onClick={() => toggleExpanded(fieldPath)}
                className="text-gray-400 hover:text-gray-300 w-4 h-4 flex-shrink-0 ml-1"
              />
            </div>
          </div>
          {isExpanded && (
            <div>
              {keys.map((subKey) => (
                <div key={subKey}>
                  {renderTreeValue(subKey, value[subKey], level + 1, fieldPath)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div style={{ paddingLeft: indent }} className="flex items-center justify-between py-1 group hover:bg-gray-800/50 rounded px-2 -mx-2">
        <div className="flex items-center">
          <span className="text-gray-300 font-medium mr-3 cursor-pointer" onClick={() => handleCopyField(fieldPath)}>{key}</span>
          <span className="text-gray-400">{String(value)}</span>
          {isColumnAdded && <Tag color="success" size="small" className="ml-2">In Table</Tag>}
        </div>
        {renderActions()}
      </div>
    );
  };

  const hasSearchResults = () => {
    if (!searchQuery) return true;
    
    const checkValue = (obj: any, path: string = ''): boolean => {
      if (obj === null || obj === undefined) return false;
      
      if (typeof obj !== 'object') {
        return path.toLowerCase().includes(searchQuery.toLowerCase()) || 
               String(obj).toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      if (Array.isArray(obj)) {
        return obj.some((item, index) => checkValue(item, `${path}.${index}`));
      }
      
      return Object.entries(obj).some(([key, value]) => 
        checkValue(value, path ? `${path}.${key}` : key)
      );
    };
    
    return checkValue(data);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
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
          <span>Click field names to copy • Hover for actions</span>
          <Space>
            <Button 
              size="small" 
              onClick={() => setExpandedFields(new Set())}
              className="text-gray-400 hover:text-white"
            >
              Collapse All
            </Button>
            <Button 
              size="small" 
              onClick={() => {
                const expandAll = (obj: any, path: string = '', set: Set<string> = new Set()): Set<string> => {
                  if (obj && typeof obj === 'object') {
                    if (Array.isArray(obj)) {
                      set.add(path);
                      obj.forEach((item, index) => {
                        const newPath = path ? `${path}.${index}` : index.toString();
                        expandAll(item, newPath, set);
                      });
                    } else {
                      set.add(path);
                      Object.entries(obj).forEach(([key, value]) => {
                        const newPath = path ? `${path}.${key}` : key;
                        expandAll(value, newPath, set);
                      });
                    }
                  }
                  return set;
                };
                setExpandedFields(expandAll(data));
              }}
              className="text-gray-400 hover:text-white"
            >
              Expand All
            </Button>
          </Space>
        </div>
      </div>

      {/* Tree View */}
      <div className="bg-gray-900 text-white p-4 rounded-lg flex-1 overflow-y-auto border border-gray-700" style={{ height: 'calc(100vh - 300px)' }}>
        <div className="font-mono text-sm space-y-1">
          {data && typeof data === 'object' && !Array.isArray(data) ? (
            Object.entries(data).map(([key, value]) => (
              <div key={key}>
                {renderTreeValue(key, value)}
              </div>
            ))
          ) : (
            <div>
              {renderTreeValue(fieldName || 'value', data)}
            </div>
          )}
          
          {searchQuery && !hasSearchResults() && (
            <div className="text-center py-8 text-gray-500">
              <SearchOutlined className="text-3xl mb-2" />
              <p>No fields match your search</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDetailPanel;