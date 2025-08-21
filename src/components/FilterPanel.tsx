import React, { useState, useMemo } from 'react';
import { Card, Select, Button, Space, Tag, Divider, InputNumber, DatePicker, Input } from 'antd';
import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import type { DataRow, Filter } from '../types';
import { getNestedValue, generateFilterLabel } from '../utils/dataUtils';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface FilterPanelProps {
  data: DataRow[];
  filters: Filter[];
  onAddFilter: (filter: Filter) => void;
  onRemoveFilter: (filterId: string) => void;
  onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  data,
  filters,
  onAddFilter,
  onRemoveFilter,
  onClearFilters
}) => {
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedOperator, setSelectedOperator] = useState<string>('equals');
  const [filterValue, setFilterValue] = useState<any>('');

  // Extract unique values for enum fields
  const getUniqueValues = useMemo(() => {
    const fieldValues: Record<string, Set<any>> = {};
    
    data.forEach(row => {
      // Define enum fields
      const enumFields = [
        'status',
        'priority', 
        'user.profile.settings.theme',
        'user.profile.settings.language',
        'activity.type',
        'browser.name',
        'browser.os',
        'geolocation.country',
        'marketing.source',
        'marketing.medium',
        'marketing.campaign'
      ];
      
      enumFields.forEach(field => {
        const value = getNestedValue(row, field);
        if (value !== null && value !== undefined) {
          if (!fieldValues[field]) {
            fieldValues[field] = new Set();
          }
          fieldValues[field].add(value);
        }
      });
    });

    // Convert Sets to sorted arrays
    const result: Record<string, any[]> = {};
    Object.entries(fieldValues).forEach(([field, valueSet]) => {
      result[field] = Array.from(valueSet).sort();
    });
    
    return result;
  }, [data]);

  // Get numeric fields
  const getNumericFields = useMemo(() => {
    return [
      'score',
      'revenue',
      'user.profile.age',
      'performance.metrics.page_load_time',
      'performance.metrics.bounce_rate',
      'performance.metrics.conversion_rate',
      'performance.metrics.session_duration'
    ];
  }, []);

  // Get date fields
  const getDateFields = useMemo(() => {
    return ['timestamp'];
  }, []);

  const handleAddFilter = () => {
    if (!selectedField || !filterValue) return;

    const newFilter: Filter = {
      id: `filter_${Date.now()}`,
      field: selectedField,
      operator: selectedOperator as 'equals' | 'contains' | 'greater' | 'less' | 'range',
      value: filterValue,
      label: generateFilterLabel(selectedField, filterValue, selectedOperator)
    };

    onAddFilter(newFilter);
    setSelectedField('');
    setFilterValue('');
  };

  const renderFilterValue = () => {
    if (!selectedField) return null;

    // Enum fields - render as Select
    if (getUniqueValues[selectedField]) {
      return (
        <Select
          value={filterValue}
          onChange={setFilterValue}
          placeholder="Select value"
          style={{ width: 200 }}
          allowClear
        >
          {getUniqueValues[selectedField].map(value => (
            <Option key={value} value={value}>
              {value}
            </Option>
          ))}
        </Select>
      );
    }

    // Numeric fields
    if (getNumericFields.includes(selectedField)) {
      if (selectedOperator === 'range') {
        return (
          <Space>
            <InputNumber
              placeholder="Min"
              value={filterValue?.min}
              onChange={min => setFilterValue({ ...filterValue, min })}
              style={{ width: 100 }}
            />
            <InputNumber
              placeholder="Max"
              value={filterValue?.max}
              onChange={max => setFilterValue({ ...filterValue, max })}
              style={{ width: 100 }}
            />
          </Space>
        );
      }
      return (
        <InputNumber
          value={filterValue}
          onChange={setFilterValue}
          placeholder="Enter number"
          style={{ width: 150 }}
        />
      );
    }

    // Date fields
    if (getDateFields.includes(selectedField)) {
      if (selectedOperator === 'range') {
        return (
          <RangePicker
            value={filterValue}
            onChange={setFilterValue}
            style={{ width: 250 }}
          />
        );
      }
      return (
        <DatePicker
          value={filterValue}
          onChange={setFilterValue}
          style={{ width: 150 }}
        />
      );
    }

    // Text fields - default
    return (
      <Input
        value={filterValue}
        onChange={e => setFilterValue(e.target.value)}
        placeholder="Enter value"
        style={{ width: 200 }}
      />
    );
  };

  const getOperatorOptions = () => {
    if (getNumericFields.includes(selectedField) || getDateFields.includes(selectedField)) {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'greater', label: 'Greater than' },
        { value: 'less', label: 'Less than' },
        { value: 'range', label: 'Between' }
      ];
    }
    
    if (getUniqueValues[selectedField]) {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'contains', label: 'Contains' }
      ];
    }

    return [
      { value: 'equals', label: 'Equals' },
      { value: 'contains', label: 'Contains' }
    ];
  };

  const getFieldDisplayName = (field: string) => {
    const displayNames: Record<string, string> = {
      'status': 'Status',
      'priority': 'Priority',
      'score': 'Score',
      'revenue': 'Revenue',
      'user.profile.age': 'User Age',
      'user.profile.settings.theme': 'Theme',
      'user.profile.settings.language': 'Language',
      'activity.type': 'Activity Type',
      'browser.name': 'Browser',
      'browser.os': 'Operating System',
      'geolocation.country': 'Country',
      'marketing.source': 'Source',
      'marketing.medium': 'Medium',
      'marketing.campaign': 'Campaign',
      'timestamp': 'Timestamp',
      'performance.metrics.page_load_time': 'Page Load Time',
      'performance.metrics.bounce_rate': 'Bounce Rate',
      'performance.metrics.conversion_rate': 'Conversion Rate',
      'performance.metrics.session_duration': 'Session Duration'
    };
    
    return displayNames[field] || field;
  };

  const getAllFilterableFields = () => {
    return [
      ...Object.keys(getUniqueValues),
      ...getNumericFields,
      ...getDateFields
    ].sort();
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <FilterOutlined className="text-purple-400" />
        <span className="text-white font-medium">Advanced Filters</span>
      </div>
      {/* Active Filters */}
      {filters.length > 0 && (
        <>
          <div style={{ marginBottom: 12 }}>
            <Space wrap>
              {filters.map(filter => (
                <Tag
                  key={filter.id}
                  closable
                  onClose={() => onRemoveFilter(filter.id)}
                  closeIcon={<CloseOutlined />}
                  color="blue"
                >
                  {getFieldDisplayName(filter.field)} {filter.operator} "{filter.value}"
                </Tag>
              ))}
            </Space>
          </div>
          <Divider style={{ margin: '8px 0' }} />
        </>
      )}

      {/* Add New Filter */}
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div className="flex-1 min-w-44">
          <label className="text-xs text-gray-400 block mb-2">Field</label>
          <Select
            value={selectedField}
            onChange={setSelectedField}
            placeholder="Select field"
            className="w-full bg-gray-700 border-gray-600"
            showSearch
            optionFilterProp="children"
            dropdownClassName="bg-gray-800 border-gray-600"
          >
            {getAllFilterableFields().map(field => (
              <Option key={field} value={field} className="bg-gray-800 text-white hover:bg-gray-700">
                {getFieldDisplayName(field)}
              </Option>
            ))}
          </Select>
        </div>

        <div className="min-w-32">
          <label className="text-xs text-gray-400 block mb-2">Operator</label>
          <Select
            value={selectedOperator}
            onChange={setSelectedOperator}
            className="w-full bg-gray-700 border-gray-600"
            disabled={!selectedField}
            dropdownClassName="bg-gray-800 border-gray-600"
          >
            {getOperatorOptions().map(option => (
              <Option key={option.value} value={option.value} className="bg-gray-800 text-white hover:bg-gray-700">
                {option.label}
              </Option>
            ))}
          </Select>
        </div>

        <div className="flex-1 min-w-44">
          <label className="text-xs text-gray-400 block mb-2">Value</label>
          {renderFilterValue()}
        </div>

        <Button
          type="primary"
          onClick={handleAddFilter}
          disabled={!selectedField || !filterValue}
          className="bg-purple-600 hover:bg-purple-500 border-purple-600 hover:border-purple-500"
        >
          Add Filter
        </Button>
      </div>

      {/* Clear All Filters */}
      {filters.length > 0 && (
        <div className="text-right">
          <Button 
            size="small" 
            onClick={onClearFilters}
            className="bg-gray-600 border-gray-600 text-white hover:bg-gray-500 hover:border-gray-500"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;