import React, { useMemo } from 'react';
import { Button, message } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, FilterOutlined } from '@ant-design/icons';
import type { DataRow, Filter } from '../types';
import { generateFilterLabel, getNestedValue } from '../utils/dataUtils';

interface InteractiveTooltipProps {
  value: any;
  field: string;
  record: DataRow;
  onAddFilter: (filter: Filter) => void;
  onAddColumn: (field: string) => void;
  onRemoveColumn: (field: string) => void;
  existingColumns: string[];
  baseColumns: string[];
}

const InteractiveTooltip: React.FC<InteractiveTooltipProps> = ({
  value,
  field,
  record,
  onAddFilter,
  onAddColumn,
  onRemoveColumn,
  existingColumns,
  baseColumns
}) => {
  // Custom JSON replacer for Maps and Sets
  const jsonReplacer = (key: string, val: any) => {
    if (val instanceof Map) {
      return Object.fromEntries(val);
    }
    if (val instanceof Set) {
      return Array.from(val);
    }
    return val;
  };

  // Determine data type for header
  const { dataType, headerColor } = useMemo(() => {
    if (value instanceof Map) {
      return { dataType: `Map (${value.size} entries)`, headerColor: '#1890ff' };
    } else if (value instanceof Set) {
      return { dataType: `Set (${value.size} items)`, headerColor: '#52c41a' };
    } else if (Array.isArray(value)) {
      return { dataType: `Array (${value.length} items)`, headerColor: '#722ed1' };
    } else if (typeof value === 'object' && value !== null) {
      const keys = Object.keys(value).length;
      return { dataType: `Object (${keys} keys)`, headerColor: '#fa8c16' };
    }
    return { dataType: typeof value, headerColor: '#666' };
  }, [value]);

  const handleAddFilter = (filterField: string, filterValue: any) => {
    try {
      const operator = typeof filterValue === 'string' ? 'equals' : 'contains';
      const filter: Filter = {
        id: `filter_${Date.now()}_${Math.random()}`,
        field: filterField,
        value: filterValue,
        operator: operator as any,
        label: generateFilterLabel(filterField, filterValue, operator),
      };
      onAddFilter(filter);
      message.success(`Filter added: ${filter.label}`);
    } catch (error) {
      message.error('Failed to create filter');
    }
  };

  const renderInlineControls = (fieldPath: string, fieldValue: any) => {
    const isColumnAdded = existingColumns.includes(fieldPath);
    const isBaseColumn = baseColumns.includes(fieldPath);
    const canRemove = isColumnAdded && !isBaseColumn;

    return (
      <span style={{ display: 'inline-flex', gap: '2px', marginLeft: '6px', opacity: 0.7 }}>
        <Button
          size="small"
          type="text"
          icon={<FilterOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleAddFilter(fieldPath, fieldValue);
          }}
          style={{ 
            fontSize: '8px', 
            padding: '0px 2px',
            minWidth: '14px',
            height: '14px',
            backgroundColor: '#1890ff',
            color: 'white',
            borderRadius: '2px'
          }}
          title="Add filter"
        />
        
        <Button
          size="small"
          type="text"
          icon={isColumnAdded ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            if (isColumnAdded) {
              onRemoveColumn(fieldPath);
            } else {
              onAddColumn(fieldPath);
            }
          }}
          style={{ 
            fontSize: '10px', 
            padding: '1px 3px',
            color: isColumnAdded ? '#52c41a' : '#8c8c8c',
            backgroundColor: 'transparent',
            border: 'none',
            minWidth: '16px',
            height: '16px',
            borderRadius: '2px'
          }}
          title={isColumnAdded ? 'Hide column' : 'Show column'}
        />
      </span>
    );
  };

  // Recursively render JSON with inline controls
  const renderInteractiveJSON = (obj: any, currentPath: string = field, depth: number = 0): React.ReactNode => {
    const indent = '  '.repeat(depth);
    
    if (obj === null || obj === undefined) {
      return <span style={{ color: 'var(--json-null)' }}>null</span>;
    }
    
    if (typeof obj === 'string') {
      return (
        <span>
          <span style={{ color: 'var(--json-string)' }}>"{obj}"</span>
          {renderInlineControls(currentPath, obj)}
        </span>
      );
    }
    
    if (typeof obj === 'number') {
      return (
        <span>
          <span style={{ color: 'var(--json-number)' }}>{obj}</span>
          {renderInlineControls(currentPath, obj)}
        </span>
      );
    }
    
    if (typeof obj === 'boolean') {
      return (
        <span>
          <span style={{ color: 'var(--json-boolean)' }}>{obj.toString()}</span>
          {renderInlineControls(currentPath, obj)}
        </span>
      );
    }

    if (obj instanceof Map) {
      const entries = Array.from(obj.entries());
      return (
        <div>
          <span style={{ color: 'var(--json-map)' }}>
            Map({entries.length}) {'{'}
            {renderInlineControls(currentPath, obj)}
          </span>
          {entries.length > 0 && (
            <div style={{ paddingLeft: '16px' }}>
              {entries.slice(0, 5).map(([key, val], index) => {
                const keyPath = `${currentPath}[${key}]`;
                return (
                  <div key={index}>
                    <span style={{ color: 'var(--json-key)' }}>"{key}"</span>: {renderInteractiveJSON(val, keyPath, depth + 1)}
                    {index < Math.min(4, entries.length - 1) && <span>,</span>}
                  </div>
                );
              })}
              {entries.length > 5 && (
                <div style={{ color: 'var(--json-punctuation)', fontStyle: 'italic' }}>
                  ... {entries.length - 5} more entries
                </div>
              )}
            </div>
          )}
          <span style={{ color: 'var(--json-map)' }}>{'}'}</span>
        </div>
      );
    }

    if (obj instanceof Set) {
      const values = Array.from(obj);
      return (
        <span>
          <span style={{ color: 'var(--json-set)' }}>
            Set({values.length}) [{values.slice(0, 3).map(v => JSON.stringify(v)).join(', ')}{values.length > 3 ? '...' : '}]'}
            {renderInlineControls(currentPath, obj)}
          </span>
        </span>
      );
    }
    
    if (Array.isArray(obj)) {
      return (
        <div>
          <span style={{ color: 'var(--json-array)' }}>
            [{renderInlineControls(currentPath, obj)}
          </span>
          {obj.length > 0 && (
            <div style={{ paddingLeft: '16px' }}>
              {obj.slice(0, 3).map((item, index) => {
                const itemPath = `${currentPath}[${index}]`;
                return (
                  <div key={index}>
                    {renderInteractiveJSON(item, itemPath, depth + 1)}
                    {index < Math.min(2, obj.length - 1) && <span>,</span>}
                  </div>
                );
              })}
              {obj.length > 3 && (
                <div style={{ color: 'var(--json-punctuation)', fontStyle: 'italic' }}>
                  ... {obj.length - 3} more items
                </div>
              )}
            </div>
          )}
          <span style={{ color: 'var(--json-array)' }}>]</span>
        </div>
      );
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const keys = Object.keys(obj);
      return (
        <div>
          <span style={{ color: 'var(--json-object)' }}>
            {'{'}
            {renderInlineControls(currentPath, obj)}
          </span>
          {keys.length > 0 && (
            <div style={{ paddingLeft: '16px' }}>
              {keys.slice(0, 5).map((key, index) => {
                const keyPath = currentPath === field ? `${currentPath}.${key}` : `${currentPath}.${key}`;
                const val = obj[key];
                return (
                  <div key={key}>
                    <span style={{ color: 'var(--json-key)' }}>"{key}"</span>: {renderInteractiveJSON(val, keyPath, depth + 1)}
                    {index < Math.min(4, keys.length - 1) && <span>,</span>}
                  </div>
                );
              })}
              {keys.length > 5 && (
                <div style={{ color: 'var(--json-punctuation)', fontStyle: 'italic' }}>
                  ... {keys.length - 5} more fields
                </div>
              )}
            </div>
          )}
          <span style={{ color: 'var(--json-object)' }}>{'}'}</span>
        </div>
      );
    }
    
    return <span>{String(obj)}</span>;
  };

  return (
    <div style={{ maxWidth: '500px', maxHeight: '400px', overflow: 'hidden', fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}>
      <div style={{ backgroundColor: headerColor, color: 'white', padding: '4px 8px', borderRadius: '4px 4px 0 0', fontSize: '11px' }}>
        <strong>"{field}"</strong> : {dataType}
      </div>
      
      {/* JSON content with inline controls */}
      <div style={{ 
        fontSize: '11px', 
        backgroundColor: 'var(--tooltip-bg)', 
        padding: '12px',
        borderRadius: '0 0 4px 4px',
        border: '1px solid var(--tooltip-border)',
        maxHeight: '350px',
        overflow: 'auto',
        lineHeight: '1.6',
        color: 'var(--text-color)'
      }}>
        {renderInteractiveJSON(value)}
      </div>
    </div>
  );
};

export default InteractiveTooltip;