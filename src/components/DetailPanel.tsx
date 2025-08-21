import React, { useState, useCallback } from 'react';
import { Collapse, Button, Space, Typography, Tag, Input, Select, message, Alert } from 'antd';
import { PlusOutlined, FilterOutlined } from '@ant-design/icons';
import type { DataRow, Filter } from '../types';
import { flattenObject, generateFilterLabel } from '../utils/dataUtils';

const { Panel } = Collapse;
const { Text, Title } = Typography;
const { Option } = Select;

interface DetailPanelProps {
  data: any; // Can be DataRow or cell value
  fieldName?: string; // When showing cell data, this is the field name
  onAddFilter: (filter: Filter) => void;
  onAddColumn: (field: string) => void;
  onRemoveColumn: (field: string) => void;
  existingColumns: string[];
  baseColumns: string[];
}

const DetailPanel: React.FC<DetailPanelProps> = ({ 
  data, 
  fieldName,
  onAddFilter, 
  onAddColumn, 
  onRemoveColumn,
  existingColumns,
  baseColumns
}) => {
  const [filterInputs, setFilterInputs] = useState<Record<string, { value: string; operator: string }>>({});

  if (!data) {
    return (
      <Alert
        message="No Data Selected"
        description="Please select a row to view its details."
        type="info"
        showIcon
      />
    );
  }

  // Handle simple values vs complex objects
  const isSimpleValue = !data || typeof data !== 'object' || data instanceof Date;
  
  let flattenedData: Record<string, any> = {};
  
  if (isSimpleValue) {
    // For simple values, create a simple display structure
    const displayName = fieldName || 'value';
    flattenedData = { [displayName]: data };
  } else {
    // For complex objects, flatten them
    try {
      flattenedData = flattenObject(data);
      
      // If flattening returns empty object, treat as simple value
      if (Object.keys(flattenedData).length === 0) {
        const displayName = fieldName || 'value';
        flattenedData = { [displayName]: data };
      }
    } catch (error) {
      console.error('Error flattening data:', error);
      return (
        <Alert
          message="Error Processing Data"
          description="Unable to process the selected data. Please try selecting a different row."
          type="error"
          showIcon
        />
      );
    }
  }

  const handleFilterInputChange = useCallback((field: string, value: string) => {
    setFilterInputs(prev => ({
      ...prev,
      [field]: { ...prev[field], value }
    }));
  }, []);

  const handleOperatorChange = useCallback((field: string, operator: string) => {
    setFilterInputs(prev => ({
      ...prev,
      [field]: { ...prev[field], operator }
    }));
  }, []);

  const handleAddFilter = useCallback((field: string, value: any) => {
    const input = filterInputs[field];
    const filterValue = input?.value || value;
    const operator = input?.operator || (Array.isArray(value) ? 'contains' : 'equals');

    if (!filterValue) {
      message.warning('Please enter a filter value');
      return;
    }

    const filter: Filter = {
      id: `filter_${Date.now()}_${Math.random()}`,
      field,
      value: filterValue,
      operator: operator as any,
      label: generateFilterLabel(field, filterValue, operator),
    };

    onAddFilter(filter);
    message.success('Filter added');
    
    setFilterInputs(prev => ({
      ...prev,
      [field]: { value: '', operator: 'equals' }
    }));
  }, [filterInputs, onAddFilter]);

  const handleAddColumn = useCallback((field: string) => {
    if (existingColumns.includes(field)) {
      message.warning('Column already exists');
      return;
    }
    onAddColumn(field);
    message.success('Column added');
  }, [existingColumns, onAddColumn]);

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <Text type="secondary">null</Text>;
    }

    if (typeof value === 'boolean') {
      return <Tag color={value ? 'green' : 'red'}>{value ? 'true' : 'false'}</Tag>;
    }

    if (value instanceof Map) {
      const entries = Array.from(value.entries());
      return (
        <div>
          <Text strong style={{ color: '#1890ff' }}>Map({entries.length})</Text>
          <div style={{ marginTop: '4px', maxHeight: '200px', overflow: 'auto' }}>
            {entries.slice(0, 10).map(([key, val], index) => (
              <div key={index} style={{ marginBottom: '4px', paddingLeft: '8px', borderLeft: '2px solid #f0f0f0' }}>
                <Text strong>{String(key)}:</Text> {renderValue(val)}
              </div>
            ))}
            {entries.length > 10 && (
              <Text type="secondary">... and {entries.length - 10} more entries</Text>
            )}
          </div>
        </div>
      );
    }

    if (value instanceof Set) {
      const items = Array.from(value);
      return (
        <div>
          <Text strong style={{ color: '#52c41a' }}>Set({items.length})</Text>
          <div style={{ marginTop: '4px' }}>
            <Space size={[0, 4]} wrap>
              {items.slice(0, 10).map((item, index) => (
                <Tag key={index} color="green">
                  {String(item)}
                </Tag>
              ))}
              {items.length > 10 && (
                <Tag color="default">
                  +{items.length - 10} more
                </Tag>
              )}
            </Space>
          </div>
        </div>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <Text type="secondary">Empty Array</Text>;
      }
      
      // Show complex array items in a structured way
      if (value.some(item => typeof item === 'object' && item !== null)) {
        return (
          <div>
            <Text strong style={{ color: '#722ed1' }}>Array({value.length})</Text>
            <div style={{ marginTop: '4px', maxHeight: '300px', overflow: 'auto' }}>
              {value.slice(0, 5).map((item, index) => (
                <div key={index} style={{ 
                  marginBottom: '8px', 
                  paddingLeft: '8px', 
                  borderLeft: '2px solid #e6f7ff',
                  backgroundColor: '#fafafa',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  <Text strong>[{index}]:</Text> {renderValue(item)}
                </div>
              ))}
              {value.length > 5 && (
                <Text type="secondary">... and {value.length - 5} more items</Text>
              )}
            </div>
          </div>
        );
      }
      
      // Simple array display
      return (
        <Space size={[0, 4]} wrap>
          {value.slice(0, 10).map((item, index) => (
            <Tag key={index} color="blue">
              {String(item)}
            </Tag>
          ))}
          {value.length > 10 && (
            <Tag color="default">
              +{value.length - 10} more
            </Tag>
          )}
        </Space>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return <Text type="secondary">Empty Object</Text>;
      }
      
      return (
        <div>
          <Text strong style={{ color: '#fa8c16' }}>Object({keys.length} keys)</Text>
          <div style={{ maxHeight: '200px', overflow: 'auto', marginTop: '4px' }}>
            <pre style={{ fontSize: '11px', margin: 0, backgroundColor: '#fafafa', padding: '8px', borderRadius: '4px' }}>
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    if (typeof value === 'number') {
      return <Text strong>{value.toLocaleString()}</Text>;
    }

    if (typeof value === 'string' && (value.includes('http://') || value.includes('https://'))) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value.length > 50 ? `${value.substring(0, 50)}...` : value}
        </a>
      );
    }

    if (typeof value === 'string' && value.includes('@')) {
      return <Text code>{value}</Text>;
    }

    return <Text>{String(value)}</Text>;
  };

  const handleQuickFilter = useCallback((field: string, value: any) => {
    try {
      let filterValue = value;
      let operator = 'equals';

      // Handle different value types for quick filtering
      if (value instanceof Map) {
        // For Maps, we can't easily filter - let user choose manually
        message.info('Maps require manual filter setup. Use the controls below.');
        return;
      }
      
      if (value instanceof Set) {
        // For Sets, convert to array and use contains
        filterValue = Array.from(value).join(', ');
        operator = 'contains';
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          message.info('Cannot filter on empty arrays');
          return;
        }
        // Use the first element for filtering
        filterValue = value[0];
        operator = 'contains';
      } else if (typeof value === 'object' && value !== null) {
        // For objects, use JSON string
        filterValue = JSON.stringify(value);
        operator = 'contains';
      } else if (typeof value === 'number') {
        operator = 'equals';
      } else if (typeof value === 'boolean') {
        operator = 'equals';
      } else {
        // String values
        operator = 'equals';
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

  const renderFieldControls = (field: string, value: any) => {
    const isColumnAdded = existingColumns.includes(field);
    const isBaseColumn = baseColumns.includes(field);
    const canRemove = isColumnAdded && !isBaseColumn;
    
    return (
      <Space size="small" style={{ marginLeft: '8px' }}>
        <Button
          size="small"
          type="text"
          onClick={() => {
            if (isColumnAdded && !isBaseColumn) {
              onRemoveColumn(field);
            } else if (!isColumnAdded) {
              handleAddColumn(field);
            }
          }}
          disabled={isBaseColumn && isColumnAdded}
          style={{ 
            fontSize: '12px', 
            padding: '2px 6px',
            color: isBaseColumn && isColumnAdded ? '#d9d9d9' : (canRemove ? '#ff4d4f' : '#52c41a'),
            border: `1px solid ${isBaseColumn && isColumnAdded ? '#d9d9d9' : (canRemove ? '#ff4d4f' : '#52c41a')}`,
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isBaseColumn && isColumnAdded ? 'not-allowed' : 'pointer'
          }}
          title={
            isBaseColumn && isColumnAdded 
              ? 'Base column - cannot be removed' 
              : (canRemove ? 'Remove from table columns' : 'Add as table column')
          }
        >
          {isColumnAdded ? '−' : '+'}
        </Button>
      </Space>
    );
  };

  const groupedData = Object.entries(flattenedData).reduce((acc, [key, value]) => {
    const parts = key.split('.');
    const section = parts[0];
    
    if (!acc[section]) {
      acc[section] = {};
    }
    
    acc[section][key] = value;
    return acc;
  }, {} as Record<string, Record<string, any>>);

  return (
    <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
      <Collapse defaultActiveKey={Object.keys(groupedData)} ghost>
        {Object.entries(groupedData).map(([section, fields]) => (
          <Panel 
            header={
              <Title level={5} style={{ margin: 0, textTransform: 'capitalize' }}>
                {section}
              </Title>
            }
            key={section}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {Object.entries(fields).map(([field, value]) => (
                <div key={field} style={{ 
                  padding: '4px 0', 
                  borderBottom: '1px solid #f0f0f0',
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: '#8b5cf6', fontSize: '12px' }}>"</span>
                      <Text 
                        strong 
                        style={{ 
                          fontSize: '12px', 
                          color: '#1890ff', 
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                        }}
                        onClick={() => handleQuickFilter(field, value)}
                        title="Click to filter by this field"
                      >
                        {field}
                      </Text>
                      <span style={{ color: '#8b5cf6', fontSize: '12px' }}>"</span>
                      <span style={{ color: '#6b7280', fontSize: '12px', margin: '0 8px' }}>:</span>
                      <span style={{ fontSize: '12px' }}>
                        {renderValue(value)}
                      </span>
                    </div>
                    {renderFieldControls(field, value)}
                  </div>
                </div>
              ))}
            </Space>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default DetailPanel;