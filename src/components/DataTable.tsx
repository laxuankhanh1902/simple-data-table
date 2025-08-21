import React, { useState, useMemo, useCallback } from 'react';
import { Table, Tooltip, Tag, Space, Drawer, Tabs, Button, Alert } from 'antd';
import { CloseOutlined, LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import type { DataRow, Filter, ColumnConfig } from '../types';
import { getNestedValue, formatValue, truncateText, applyFilters, applySearchQuery } from '../utils/dataUtils';
import EnhancedDetailPanel from './EnhancedDetailPanel';
import FilterTags from './FilterTags';
import InteractiveJSON from './InteractiveJSON';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ViewsController from './ViewsController';
import InteractiveTooltip from './InteractiveTooltip';
import ColumnsController from './ColumnsController';
import ErrorBoundary from './ErrorBoundary';

interface DataTableProps {
  data: DataRow[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  // All hooks must be at the top, before any conditionals
  const [selectedRecord, setSelectedRecord] = useState<DataRow | null>(null);
  const [selectedCellData, setSelectedCellData] = useState<{ value: any; field: string; record: DataRow } | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentRecordIndex, setCurrentRecordIndex] = useState<number>(-1);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [additionalColumns, setAdditionalColumns] = useState<ColumnConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [showQuickFilter, setShowQuickFilter] = useState(false);

  // Define base column keys to avoid circular dependency
  const baseColumnKeys = useMemo(() => [
    'id', 'timestamp', 'user', 'user.email', 'status', 'priority', 
    'score', 'revenue', 'activity.type', 'tags'
  ], []);

  // Initialize visible columns with base columns
  const allAvailableColumns = useMemo(() => {
    const dynamicCols = additionalColumns.map(col => col.key);
    const allBaseCols = [...baseColumnKeys, ...dynamicCols];
    
    // If we have a custom order in visibleColumns, use that as the base order
    // Otherwise, use the default order
    if (visibleColumns.length > 0) {
      const orderedCols: string[] = [];
      
      // First, add columns that are in visibleColumns in their order
      visibleColumns.forEach(col => {
        if (allBaseCols.includes(col) && !orderedCols.includes(col)) {
          orderedCols.push(col);
        }
      });
      
      // Then add any remaining columns that aren't in visibleColumns yet
      allBaseCols.forEach(col => {
        if (!orderedCols.includes(col)) {
          orderedCols.push(col);
        }
      });
      
      return orderedCols;
    }
    
    return allBaseCols;
  }, [baseColumnKeys, additionalColumns, visibleColumns]);

  // Initialize visible columns on first load
  React.useEffect(() => {
    if (visibleColumns.length === 0) {
      setVisibleColumns([...baseColumnKeys]);
    }
  }, [baseColumnKeys, visibleColumns.length]);

  // Close filter panel on Escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showQuickFilter) {
        setShowQuickFilter(false);
      }
    };

    if (showQuickFilter) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showQuickFilter]);

  const filteredData = useMemo(() => {
    try {
      // First apply search query, then filters
      let result = applySearchQuery(data, searchQuery);
      result = applyFilters(result, filters);
      
      // Filter out any null, undefined, or empty records that might cause display issues
      result = result.filter(record => 
        record && 
        typeof record === 'object' && 
        record.id && 
        record.id !== ''
      );
      
      return result;
    } catch (error) {
      console.error('Error filtering data:', error);
      return data;
    }
  }, [data, filters, searchQuery]);

  // Handle clicking on any part of the row - shows full record details
  const handleRowClick = useCallback((record: DataRow) => {
    const recordIndex = filteredData.findIndex(r => r.id === record.id);
    setSelectedRecord(record);
    setSelectedCellData(null); // Clear cell selection
    setCurrentRecordIndex(recordIndex);
    setDrawerVisible(true);
  }, [filteredData]);

  const handleCloseDrawer = useCallback(() => {
    setDrawerVisible(false);
    setSelectedRecord(null);
    setSelectedCellData(null);
    setCurrentRecordIndex(-1);
  }, []);

  const handleNavigatePrevious = useCallback(() => {
    if (currentRecordIndex > 0) {
      const newIndex = currentRecordIndex - 1;
      const newRecord = filteredData[newIndex];
      setCurrentRecordIndex(newIndex);
      setSelectedRecord(newRecord);
      setSelectedCellData(null); // Always show record view
    }
  }, [currentRecordIndex, filteredData]);

  const handleNavigateNext = useCallback(() => {
    if (currentRecordIndex < filteredData.length - 1) {
      const newIndex = currentRecordIndex + 1;
      const newRecord = filteredData[newIndex];
      setCurrentRecordIndex(newIndex);
      setSelectedRecord(newRecord);
      setSelectedCellData(null); // Always show record view
    }
  }, [currentRecordIndex, filteredData]);

  const handleAddFilter = useCallback((filter: Filter) => {
    setFilters(prev => {
      const exists = prev.some(f => f.field === filter.field && JSON.stringify(f.value) === JSON.stringify(filter.value));
      if (exists) return prev;
      return [...prev, filter];
    });
    // Hide the filter panel after adding a filter
    setShowQuickFilter(false);
  }, []);

  const handleRemoveFilter = useCallback((index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoveFilterById = useCallback((filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const handleAddColumn = useCallback((field: string) => {
    const newColumn: ColumnConfig = {
      key: field,
      title: field.split('.').pop() || field,
      dataIndex: field,
      width: 200,
    };

    setAdditionalColumns(prev => {
      const exists = prev.some(col => col.key === field);
      if (exists) return prev;
      return [...prev, newColumn];
    });
  }, []);

  const handleRemoveColumn = useCallback((field: string) => {
    setAdditionalColumns(prev => prev.filter(col => col.key !== field));
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleApplyView = useCallback((view: any) => {
    setFilters(view.filters || []);
    setAdditionalColumns(
      view.columns
        .filter((col: string) => !baseColumnKeys.includes(col))
        .map((col: string) => ({
          key: col,
          title: col.split('.').pop() || col,
          dataIndex: col,
          width: 200,
        }))
    );
    setSearchQuery(view.searchQuery || '');
  }, [baseColumnKeys]);

  const handleColumnsChange = useCallback((columns: string[]) => {
    const dynamicCols = columns
      .filter(col => !baseColumnKeys.includes(col))
      .map(col => ({
        key: col,
        title: col.split('.').pop() || col,
        dataIndex: col,
        width: 200,
      }));
    setAdditionalColumns(dynamicCols);
  }, [baseColumnKeys]);

  const handleToggleColumn = useCallback((column: string, visible: boolean) => {
    if (visible) {
      // Add column
      setVisibleColumns(prev => {
        if (!prev.includes(column)) {
          return [...prev, column];
        }
        return prev;
      });
      
      // If it's not a base column, add to additional columns
      if (!baseColumnKeys.includes(column)) {
        handleAddColumn(column);
      }
    } else {
      // Remove column (both base and dynamic columns can be removed)
      setVisibleColumns(prev => prev.filter(col => col !== column));
      
      // If it's not a base column, remove from additional columns
      if (!baseColumnKeys.includes(column)) {
        handleRemoveColumn(column);
      }
    }
  }, [baseColumnKeys, handleAddColumn, handleRemoveColumn]);

  // Update handleRemoveColumn to work with base columns via visibility
  const handleRemoveColumnByField = useCallback((field: string) => {
    handleToggleColumn(field, false);
  }, [handleToggleColumn]);

  // Update handleAddColumn to work with base columns via visibility  
  const handleAddColumnByField = useCallback((field: string) => {
    handleToggleColumn(field, true);
  }, [handleToggleColumn]);

  const handleResetColumns = useCallback(() => {
    setVisibleColumns([...baseColumnKeys]);
    setAdditionalColumns([]);
  }, [baseColumnKeys]);

  const handleReorderColumns = useCallback((newOrder: string[]) => {
    // Update the visibleColumns to maintain the new order
    setVisibleColumns(prev => {
      const newVisibleColumns = newOrder.filter(col => prev.includes(col));
      return newVisibleColumns.length > 0 ? newVisibleColumns : prev;
    });
  }, []);

  const renderCell = useCallback((value: any, record: DataRow, field: string) => {
    try {
      const displayValue = formatValue(value);
      const truncated = truncateText(displayValue, 30);
      
      // Check if this is a complex object that would benefit from interactive tooltip
      const isComplexObject = value && typeof value === 'object' && 
        (value instanceof Map || value instanceof Set || Array.isArray(value) || 
         (typeof value === 'object' && Object.keys(value).length > 0));
      
      // Create tooltip content
      let tooltipContent;
      
      if (isComplexObject) {
        // Use InteractiveTooltip for complex objects only
        tooltipContent = (
          <InteractiveTooltip
            value={value}
            field={field}
            record={record}
            onAddFilter={handleAddFilter}
            onAddColumn={handleAddColumnByField}
            onRemoveColumn={handleRemoveColumnByField}
            existingColumns={visibleColumns}
            baseColumns={baseColumnKeys}
          />
        );
      } else {
        // No tooltip for simple values
        tooltipContent = null;
      }
      
      const cellSpan = (
        <span style={{ color: 'var(--text-primary)' }}>
          {truncated}
        </span>
      );

      return tooltipContent ? (
        <Tooltip 
          title={tooltipContent} 
          placement="topLeft"
          overlayStyle={{ maxWidth: '500px' }}
        >
          {cellSpan}
        </Tooltip>
      ) : (
        cellSpan
      );
    } catch (error) {
      console.error('Error rendering cell:', error, { value, field });
      return (
        <span style={{ color: '#ff4d4f' }}>
          Error
        </span>
      );
    }
  }, [handleAddFilter, handleAddColumn, handleRemoveColumn, baseColumnKeys, additionalColumns]);

  // Early returns after all hooks
  if (!data || !Array.isArray(data)) {
    return (
      <Alert
        message="Invalid Data"
        description="The provided data is invalid or empty. Please check your data source."
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  if (data.length === 0) {
    return (
      <Alert
        message="No Data"
        description="No data available to display in the table."
        type="info"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  const baseColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      fixed: 'left' as const,
      sorter: (a: DataRow, b: DataRow) => a.id.localeCompare(b.id),
      render: (value: string, record: DataRow) => renderCell(value, record, 'id'),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      sorter: (a: DataRow, b: DataRow) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      render: (value: string, record: DataRow) => {
        const date = new Date(value).toLocaleString();
        return renderCell(date, record, 'timestamp');
      },
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 250,
      sorter: (a: DataRow, b: DataRow) => (a.user?.name || '').localeCompare(b.user?.name || ''),
      render: (value: any, record: DataRow) => renderCell(value, record, 'user'),
    },
    {
      title: 'Email',
      dataIndex: ['user', 'email'],
      key: 'user.email',
      width: 200,
      sorter: (a: DataRow, b: DataRow) => (a.user?.email || '').localeCompare(b.user?.email || ''),
      render: (value: string, record: DataRow) => renderCell(value, record, 'user.email'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      sorter: (a: DataRow, b: DataRow) => a.status.localeCompare(b.status),
      render: (status: string) => {
        const color = {
          active: 'green',
          inactive: 'red',
          pending: 'orange',
          suspended: 'purple',
        }[status] || 'default';
        
        return (
          <Tooltip title={`Status: ${status}`}>
            <Tag color={color}>
              {status.toUpperCase()}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      sorter: (a: DataRow, b: DataRow) => {
        const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
      },
      render: (priority: string) => {
        const color = {
          low: 'blue',
          medium: 'orange',
          high: 'red',
          critical: 'magenta',
        }[priority] || 'default';
        
        return (
          <Tooltip title={`Priority: ${priority}`}>
            <Tag color={color}>
              {priority.toUpperCase()}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      sorter: (a: DataRow, b: DataRow) => a.score - b.score,
      render: (value: number, record: DataRow) => renderCell(value, record, 'score'),
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 120,
      sorter: (a: DataRow, b: DataRow) => a.revenue - b.revenue,
      render: (value: number, record: DataRow) => renderCell(`$${value.toFixed(2)}`, record, 'revenue'),
    },
    {
      title: 'Activity',
      dataIndex: ['activity', 'type'],
      key: 'activity.type',
      width: 100,
      sorter: (a: DataRow, b: DataRow) => (a.activity?.type || '').localeCompare(b.activity?.type || ''),
      render: (value: string, record: DataRow) => renderCell(value, record, 'activity.type'),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      sorter: (a: DataRow, b: DataRow) => a.tags.length - b.tags.length,
      render: (tags: string[]) => (
        <Tooltip title={`Tags: ${tags.join(', ')}`}>
          <Space size={[0, 8]} wrap>
            {tags.slice(0, 2).map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))}
            {tags.length > 2 && (
              <Tag color="default">
                +{tags.length - 2}
              </Tag>
            )}
          </Space>
        </Tooltip>
      ),
    },
  ];

  const dynamicColumns = additionalColumns.map(col => ({
    ...col,
    sorter: (a: DataRow, b: DataRow) => {
      try {
        const aValue = getNestedValue(a, col.dataIndex);
        const bValue = getNestedValue(b, col.dataIndex);
        
        // Handle different data types for sorting
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return aValue - bValue;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue);
        }
        if (aValue instanceof Date && bValue instanceof Date) {
          return aValue.getTime() - bValue.getTime();
        }
        // For complex objects, convert to string and compare
        return String(aValue || '').localeCompare(String(bValue || ''));
      } catch (error) {
        console.error('Error sorting dynamic column:', error);
        return 0;
      }
    },
    render: (_: any, record: DataRow) => {
      try {
        // Get the actual value at the field path - could be a primitive or complex object
        const value = getNestedValue(record, col.dataIndex);
        return renderCell(value, record, col.dataIndex);
      } catch (error) {
        console.error('Error rendering dynamic column:', error, { col, record });
        return <span style={{ color: '#ff4d4f' }}>Error</span>;
      }
    },
  }));

  const allColumns = [...baseColumns, ...dynamicColumns];
  
  // Filter and order columns based on visibility and the order in visibleColumns
  const visibleColumnsData = useMemo(() => {
    // Create a map for quick lookup of columns
    const columnMap = new Map(allColumns.map(col => [col.key, col]));
    
    // Return columns in the order specified by visibleColumns
    return visibleColumns
      .map(key => columnMap.get(key))
      .filter(col => col !== undefined) as ColumnConfig[];
  }, [allColumns, visibleColumns]);


  const detailTabs = [
    {
      key: 'readable',
      label: 'Human Readable',
      children: (selectedRecord || selectedCellData) ? (
        <EnhancedDetailPanel 
          data={selectedCellData ? selectedCellData.value : selectedRecord} 
          fieldName={selectedCellData ? selectedCellData.field : undefined}
          onAddFilter={handleAddFilter}
          onAddColumn={handleAddColumnByField}
          onRemoveColumn={handleRemoveColumnByField}
          existingColumns={visibleColumns}
          baseColumns={baseColumnKeys}
        />
      ) : null,
    },
    {
      key: 'raw',
      label: 'Raw JSON',
      children: (selectedRecord || selectedCellData) ? (
        <InteractiveJSON
          data={selectedCellData ? selectedCellData.value : selectedRecord}
          fieldName={selectedCellData ? selectedCellData.field : undefined}
          onAddFilter={handleAddFilter}
          onAddColumn={handleAddColumnByField}
          onRemoveColumn={handleRemoveColumnByField}
          existingColumns={visibleColumns}
          baseColumns={baseColumnKeys}
        />
      ) : null,
    },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-full mx-auto space-y-6 px-4">

          {/* Kibana-style Search Bar */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-xl mb-6">
            <div className="flex items-center gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <SearchBar 
                  onSearch={handleSearch}
                />
              </div>

              {/* Add Filter Button */}
              <Button
                type="text"
                icon={<PlusOutlined />}
                className={`text-gray-300 hover:text-white hover:bg-gray-800 border rounded-lg px-4 py-2 ${
                  showQuickFilter 
                    ? 'border-blue-500 bg-gray-800 text-white' 
                    : 'border-gray-600 hover:border-blue-500'
                }`}
                onClick={() => setShowQuickFilter(!showQuickFilter)}
              >
                Add filter
              </Button>

              {/* Clear All Filters and Controls */}
              <div className="flex items-center gap-2">
                {(filters.length > 0 || searchQuery) && (
                  <Button
                    type="text"
                    className="text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-600 hover:border-red-500 rounded-lg px-3 py-2"
                    onClick={() => {
                      setFilters([]);
                      setSearchQuery('');
                      setShowQuickFilter(false);
                    }}
                  >
                    Clear all
                  </Button>
                )}
                
                <ViewsController
                  currentFilters={filters}
                  currentColumns={allColumns.map(col => col.key)}
                  currentSearchQuery={searchQuery}
                  onApplyView={handleApplyView}
                  onFiltersChange={setFilters}
                  onColumnsChange={handleColumnsChange}
                  onSearchChange={setSearchQuery}
                  baseColumns={baseColumnKeys}
                  totalRecords={data.length}
                  filteredRecords={filteredData.length}
                  iconOnly={true}
                />
                
                <ColumnsController
                  allColumns={allAvailableColumns}
                  visibleColumns={visibleColumns}
                  baseColumns={baseColumnKeys}
                  onToggleColumn={handleToggleColumn}
                  onResetColumns={handleResetColumns}
                  onReorderColumns={handleReorderColumns}
                />
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showQuickFilter && (
            <div className="mb-6">
              <FilterPanel
                data={data}
                filters={filters}
                onAddFilter={handleAddFilter}
                onRemoveFilter={handleRemoveFilterById}
                onClearFilters={handleClearFilters}
              />
            </div>
          )}

          {/* Active Filters & Status */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <FilterTags 
                filters={filters} 
                onRemove={handleRemoveFilter}
                additionalColumns={additionalColumns}
                onRemoveColumn={handleRemoveColumn}
              />
            </div>
            
            <div className="text-sm text-gray-400 ml-4">
              Showing <span className="font-semibold text-blue-400">{filteredData.length}</span> of {data.length} records
              {filters.length > 0 && (
                <span className="ml-2 text-purple-400">
                  ({filters.length} filter{filters.length !== 1 ? 's' : ''} applied)
                </span>
              )}
            </div>
          </div>

          {/* Full Width Data Table */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
            <Table
              columns={visibleColumnsData}
              dataSource={filteredData}
              rowKey="id"
              scroll={{ x: 1500, y: 600 }}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                style: { cursor: 'pointer' }
              })}
              pagination={{
                pageSize: 50,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
              size="small"
              bordered
              className="dark-table"
            />
          </div>
        </div>
      </div>

        <Drawer
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>
                  Record Details
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {currentRecordIndex + 1} of {filteredData.length}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button 
                  type="text" 
                  icon={<LeftOutlined />} 
                  onClick={handleNavigatePrevious}
                  disabled={currentRecordIndex <= 0}
                  size="small"
                  title="Previous record"
                />
                <Button 
                  type="text" 
                  icon={<RightOutlined />} 
                  onClick={handleNavigateNext}
                  disabled={currentRecordIndex >= filteredData.length - 1}
                  size="small"
                  title="Next record"
                />
                <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 4px' }} />
                <Button 
                  type="text" 
                  icon={<CloseOutlined />} 
                  onClick={handleCloseDrawer}
                  size="small"
                  title="Close"
                />
              </div>
            </div>
          }
          placement="right"
          width={600}
          open={drawerVisible}
          onClose={handleCloseDrawer}
          closable={false}
          styles={{
            body: { padding: '20px' },
          }}
        >
          <ErrorBoundary>
            <Tabs 
              items={detailTabs}
              defaultActiveKey="readable"
              className="drawer-tabs"
            />
          </ErrorBoundary>
        </Drawer>
    </ErrorBoundary>
  );
};

export default DataTable;