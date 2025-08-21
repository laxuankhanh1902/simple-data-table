import React, { useState, useCallback, useMemo } from 'react';
import { 
  Card, Button, Space, Typography, Tag, Input, message, 
  Tooltip, Divider, Badge, Row, Col, Flex
} from 'antd';
import { 
  PlusOutlined, MinusOutlined, FilterOutlined, CopyOutlined, 
  SearchOutlined, EyeOutlined, BookOutlined, NumberOutlined,
  CalendarOutlined, LinkOutlined, FileTextOutlined
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

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <Card size="small" className="border-l-4 border-l-blue-500">
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Search
              placeholder="Search fields and values..."
              allowClear
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col>
            <Space>
              <Badge count={filteredFields.length} showZero>
                <Button icon={<EyeOutlined />} size="small">
                  Fields
                </Button>
              </Badge>
              <Badge count={selectedFields.length} showZero>
                <Button icon={<BookOutlined />} size="small">
                  Selected
                </Button>
              </Badge>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Fields Display */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredFields.map(([field, value], index) => {
          const { type, icon, color } = getFieldType(value);
          const isColumnAdded = existingColumns.includes(field);
          const isBaseColumn = baseColumns.includes(field);
          const canRemove = isColumnAdded && !isBaseColumn;

          return (
            <Card 
              key={field} 
              size="small" 
              className="transition-all duration-200 hover:shadow-md border-l-4 hover:border-l-blue-400"
              style={{ borderLeftColor: color }}
            >
              <Row gutter={[12, 8]} align="top">
                {/* Field Info */}
                <Col flex="auto">
                  <div className="space-y-2">
                    {/* Field Header */}
                    <Flex justify="space-between" align="center">
                      <Space size="small">
                        <span style={{ color }}>{icon}</span>
                        <Tooltip title="Click to copy field name">
                          <Text 
                            strong 
                            className="cursor-pointer hover:text-blue-500 font-mono text-sm"
                            onClick={() => handleCopyField(field)}
                          >
                            {field}
                          </Text>
                        </Tooltip>
                        <Tag color={color} className="text-xs">
                          {type}
                        </Tag>
                      </Space>
                    </Flex>

                    {/* Field Value */}
                    <div className="pl-6 border-l-2 border-gray-100 dark:border-gray-700">
                      {renderValue(value)}
                    </div>
                  </div>
                </Col>

                {/* Controls */}
                <Col>
                  <Space direction="vertical" size="small">
                    <Space size="small">
                      <Tooltip title="Add filter">
                        <Button
                          type="text"
                          size="small"
                          icon={<FilterOutlined />}
                          onClick={() => handleAddFilter(field, value)}
                          className="text-blue-500 hover:text-blue-700"
                        />
                      </Tooltip>
                      
                      <Tooltip title="Copy value">
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => handleCopyValue(value)}
                          className="text-green-500 hover:text-green-700"
                        />
                      </Tooltip>
                      
                      <Tooltip title={
                        isBaseColumn && isColumnAdded 
                          ? 'Base column - cannot be removed' 
                          : (canRemove ? 'Remove from table' : 'Add to table')
                      }>
                        <Button
                          type="text"
                          size="small"
                          icon={isColumnAdded ? <MinusOutlined /> : <PlusOutlined />}
                          onClick={() => {
                            if (isColumnAdded && !isBaseColumn) {
                              handleRemoveColumn(field);
                            } else if (!isColumnAdded) {
                              handleAddColumn(field);
                            }
                          }}
                          disabled={isBaseColumn && isColumnAdded}
                          className={
                            isBaseColumn && isColumnAdded 
                              ? 'text-gray-400' 
                              : (canRemove ? 'text-red-500 hover:text-red-700' : 'text-orange-500 hover:text-orange-700')
                          }
                        />
                      </Tooltip>
                    </Space>
                    
                    {isColumnAdded && (
                      <Tag color="success" className="text-xs">
                        In Table
                      </Tag>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          );
        })}
      </div>

      {filteredFields.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500">
          <SearchOutlined className="text-3xl mb-2" />
          <p>No fields match your search</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedDetailPanel;