import React, { useState, useCallback, useEffect } from 'react';
import { 
  Card, Button, Space, Typography, Input, message, 
  Modal, List, Tag, Tooltip, Divider, Row, Col, Badge,
  Popconfirm, Empty
} from 'antd';
import { 
  SaveOutlined, DeleteOutlined, EditOutlined,
  StarOutlined, StarFilled, FilterOutlined,
  TableOutlined, SearchOutlined, SettingOutlined,
  BookOutlined
} from '@ant-design/icons';
import type { Filter } from '../types';

const { Text } = Typography;
const { Search } = Input;

interface SavedView {
  id: string;
  name: string;
  description?: string;
  filters: Filter[];
  columns: string[];
  searchQuery: string;
  createdAt: Date;
  isDefault?: boolean;
  isFavorite?: boolean;
}

interface ViewsControllerProps {
  currentFilters: Filter[];
  currentColumns: string[];
  currentSearchQuery: string;
  onApplyView: (view: SavedView) => void;
  onFiltersChange: (filters: Filter[]) => void;
  onColumnsChange: (columns: string[]) => void;
  onSearchChange: (query: string) => void;
  baseColumns: string[];
  totalRecords: number;
  filteredRecords: number;
  iconOnly?: boolean;
}

const ViewsController: React.FC<ViewsControllerProps> = ({
  currentFilters,
  currentColumns,
  currentSearchQuery,
  onApplyView,
  onFiltersChange,
  onColumnsChange,
  onSearchChange,
  baseColumns,
  totalRecords,
  filteredRecords,
  iconOnly = false
}) => {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showViewsModal, setShowViewsModal] = useState(false);
  const [editingView, setEditingView] = useState<SavedView | null>(null);
  const [viewName, setViewName] = useState('');
  const [viewDescription, setViewDescription] = useState('');
  const [searchViews, setSearchViews] = useState('');

  // Load saved views from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kibana-table-views');
      if (saved) {
        const views = JSON.parse(saved).map((view: any) => ({
          ...view,
          createdAt: new Date(view.createdAt)
        }));
        setSavedViews(views);
      }
    } catch (error) {
      console.error('Error loading saved views:', error);
    }
  }, []);

  // Save views to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('kibana-table-views', JSON.stringify(savedViews));
    } catch (error) {
      console.error('Error saving views:', error);
    }
  }, [savedViews]);

  const handleSaveView = useCallback(() => {
    if (!viewName.trim()) {
      message.error('Please enter a view name');
      return;
    }

    const newView: SavedView = {
      id: editingView?.id || `view_${Date.now()}_${Math.random()}`,
      name: viewName.trim(),
      description: viewDescription.trim(),
      filters: [...currentFilters],
      columns: [...currentColumns],
      searchQuery: currentSearchQuery,
      createdAt: editingView?.createdAt || new Date(),
      isDefault: editingView?.isDefault || false,
      isFavorite: editingView?.isFavorite || false
    };

    setSavedViews(prev => {
      if (editingView) {
        return prev.map(view => view.id === editingView.id ? newView : view);
      } else {
        return [...prev, newView];
      }
    });

    message.success(editingView ? 'View updated successfully' : 'View saved successfully');
    setShowSaveModal(false);
    setEditingView(null);
    setViewName('');
    setViewDescription('');
  }, [viewName, viewDescription, currentFilters, currentColumns, currentSearchQuery, editingView]);

  const handleApplyView = useCallback((view: SavedView) => {
    onApplyView(view);
    message.success(`Applied view: ${view.name}`);
    setShowViewsModal(false);
  }, [onApplyView]);

  const handleDeleteView = useCallback((viewId: string) => {
    setSavedViews(prev => prev.filter(view => view.id !== viewId));
    message.success('View deleted');
  }, []);

  const handleToggleFavorite = useCallback((viewId: string) => {
    setSavedViews(prev => prev.map(view => 
      view.id === viewId ? { ...view, isFavorite: !view.isFavorite } : view
    ));
  }, []);

  const handleSetDefault = useCallback((viewId: string) => {
    setSavedViews(prev => prev.map(view => 
      ({ ...view, isDefault: view.id === viewId })
    ));
    message.success('Default view updated');
  }, []);

  const handleEditView = useCallback((view: SavedView) => {
    setEditingView(view);
    setViewName(view.name);
    setViewDescription(view.description || '');
    setShowSaveModal(true);
  }, []);

  const handleClearAll = useCallback(() => {
    onFiltersChange([]);
    onColumnsChange(baseColumns);
    onSearchChange('');
    message.success('All filters and columns cleared');
  }, [onFiltersChange, onColumnsChange, onSearchChange, baseColumns]);

  const filteredViews = savedViews.filter(view => 
    !searchViews || 
    view.name.toLowerCase().includes(searchViews.toLowerCase()) ||
    (view.description && view.description.toLowerCase().includes(searchViews.toLowerCase()))
  );

  const favoriteViews = filteredViews.filter(view => view.isFavorite);
  const defaultView = savedViews.find(view => view.isDefault);
  const hasActiveFilters = currentFilters.length > 0 || currentSearchQuery || 
    currentColumns.length !== baseColumns.length ||
    !currentColumns.every(col => baseColumns.includes(col));

  // Extract modals for reuse
  const modals = (
    <>
      {/* Save View Modal */}
      <Modal
        title={editingView ? 'Edit View' : 'Save Current View'}
        open={showSaveModal}
        onOk={handleSaveView}
        onCancel={() => {
          setShowSaveModal(false);
          setEditingView(null);
          setViewName('');
          setViewDescription('');
        }}
        okText={editingView ? 'Update' : 'Save'}
      >
        <div className="space-y-4">
          <div>
            <Text strong>View Name *</Text>
            <Input
              placeholder="Enter view name..."
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              className="mt-2"
            />
          </div>
          
          <div>
            <Text strong>Description</Text>
            <Input.TextArea
              placeholder="Optional description..."
              value={viewDescription}
              onChange={(e) => setViewDescription(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <Divider />
          
          <div className="space-y-2">
            <Text strong>Current Configuration:</Text>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• Filters: {currentFilters.length}</div>
              <div>• Columns: {currentColumns.length}</div>
              <div>• Search: {currentSearchQuery || 'None'}</div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Views List Modal */}
      <Modal
        title="Saved Views"
        open={showViewsModal}
        onCancel={() => setShowViewsModal(false)}
        footer={null}
        width={700}
      >
        <div className="space-y-4">
          <Search
            placeholder="Search views..."
            value={searchViews}
            onChange={(e) => setSearchViews(e.target.value)}
            allowClear
          />
          
          {filteredViews.length === 0 ? (
            <Empty description="No saved views found" />
          ) : (
            <List
              dataSource={filteredViews}
              renderItem={(view) => (
                <List.Item
                  actions={[
                    <Button
                      key="edit"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingView(view);
                        setViewName(view.name);
                        setViewDescription(view.description || '');
                        setShowSaveModal(true);
                        setShowViewsModal(false);
                      }}
                    />,
                    <Popconfirm
                      key="delete"
                      title="Delete this view?"
                      onConfirm={() => handleDeleteView(view.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="text" icon={<DeleteOutlined />} danger />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Space>
                        <Text strong>{view.name}</Text>
                        {view.isDefault && <Tag color="blue">Default</Tag>}
                        {view.isFavorite && <StarFilled className="text-yellow-500" />}
                      </Space>
                    }
                    description={
                      <div className="space-y-2">
                        {view.description && (
                          <Text type="secondary">{view.description}</Text>
                        )}
                        <Space wrap size="small">
                          <Tag icon={<FilterOutlined />} color="blue">
                            {view.filters.length} filters
                          </Tag>
                          <Tag icon={<TableOutlined />} color="green">
                            {view.columns.length} columns
                          </Tag>
                          {view.searchQuery && (
                            <Tag icon={<SearchOutlined />} color="orange">
                              Search: {view.searchQuery}
                            </Tag>
                          )}
                          <Text type="secondary" className="text-xs">
                            {view.createdAt.toLocaleDateString()}
                          </Text>
                        </Space>
                      </div>
                    }
                  />
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleApplyView(view)}
                  >
                    Apply
                  </Button>
                </List.Item>
              )}
            />
          )}
        </div>
      </Modal>
    </>
  );

  // Icon-only mode render
  if (iconOnly) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          type="text"
          onClick={() => setShowViewsModal(true)}
          className="bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-md px-3 py-2 h-9 flex items-center gap-2 text-sm font-medium transition-all duration-200 shadow-sm"
          title={`Views (${savedViews.length} saved)`}
        >
          <BookOutlined className="text-sm" />
          <span>Views</span>
          <div className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {savedViews.length}
          </div>
        </Button>
        
        <Button 
          type="text"
          onClick={() => setShowSaveModal(true)}
          disabled={!hasActiveFilters}
          className={`transition-all duration-200 rounded-md px-3 py-2 h-9 flex items-center gap-2 text-sm font-medium shadow-sm ${
            hasActiveFilters 
              ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white' 
              : 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed opacity-50'
          }`}
          title={hasActiveFilters ? "Save current view" : "Configure filters to save view"}
        >
          <SaveOutlined className="text-sm" />
          <span>Save</span>
        </Button>
        
        {modals}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Controls */}
      <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge count={currentFilters.length} showZero className="bg-blue-500">
              <Button 
                icon={<FilterOutlined />} 
                onClick={() => setShowViewsModal(true)}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500"
              >
                Views ({savedViews.length})
              </Button>
            </Badge>
            
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={() => setShowSaveModal(true)}
              disabled={!hasActiveFilters}
              className="bg-blue-600 hover:bg-blue-500 border-blue-600 hover:border-blue-500"
            >
              Save View
            </Button>

            {defaultView && (
              <Tooltip title={`Apply default view: ${defaultView.name}`}>
                <Button 
                  icon={<StarFilled />} 
                  onClick={() => handleApplyView(defaultView)}
                  className="bg-yellow-600 border-yellow-600 text-white hover:bg-yellow-500 hover:border-yellow-500"
                >
                  Default
                </Button>
              </Tooltip>
            )}

            <Button 
              icon={<DeleteOutlined />} 
              onClick={handleClearAll}
              disabled={!hasActiveFilters}
              danger
              className="bg-red-600 border-red-600 hover:bg-red-500 hover:border-red-500"
            >
              Clear All
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Text className="text-gray-300 text-sm">
              {filteredRecords} of {totalRecords} records
            </Text>
            {hasActiveFilters && (
              <Badge status="processing" text="Active filters" className="text-blue-400" />
            )}
          </div>
        </div>

        {/* Quick Favorites */}
        {favoriteViews.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <Text className="text-gray-400 text-xs mb-2 block">Quick Access:</Text>
            <div className="flex flex-wrap gap-2">
              {favoriteViews.slice(0, 5).map(view => (
                <Button
                  key={view.id}
                  size="small"
                  type="text"
                  icon={<StarFilled className="text-yellow-400" />}
                  onClick={() => handleApplyView(view)}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 text-xs border border-gray-600 hover:border-gray-500"
                >
                  {view.name}
                </Button>
              ))}
              {favoriteViews.length > 5 && (
                <Text className="text-gray-400 text-xs self-center">
                  +{favoriteViews.length - 5} more
                </Text>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save View Modal */}
      <Modal
        title={editingView ? 'Edit View' : 'Save Current View'}
        open={showSaveModal}
        onOk={handleSaveView}
        onCancel={() => {
          setShowSaveModal(false);
          setEditingView(null);
          setViewName('');
          setViewDescription('');
        }}
        okText={editingView ? 'Update' : 'Save'}
      >
        <div className="space-y-4">
          <div>
            <Text strong>View Name *</Text>
            <Input
              placeholder="Enter view name..."
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              className="mt-2"
            />
          </div>
          
          <div>
            <Text strong>Description</Text>
            <Input.TextArea
              placeholder="Optional description..."
              value={viewDescription}
              onChange={(e) => setViewDescription(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <Divider />
          
          <div className="space-y-2">
            <Text strong>Current Configuration:</Text>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• Filters: {currentFilters.length}</div>
              <div>• Columns: {currentColumns.length}</div>
              <div>• Search: {currentSearchQuery || 'None'}</div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Views List Modal */}
      <Modal
        title="Saved Views"
        open={showViewsModal}
        onCancel={() => setShowViewsModal(false)}
        footer={null}
        width={700}
      >
        <div className="space-y-4">
          <Search
            placeholder="Search views..."
            value={searchViews}
            onChange={(e) => setSearchViews(e.target.value)}
            allowClear
          />

          {filteredViews.length === 0 ? (
            <Empty 
              description="No saved views found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={filteredViews}
              renderItem={(view) => (
                <List.Item
                  key={view.id}
                  actions={[
                    <Tooltip title="Toggle favorite">
                      <Button
                        type="text"
                        size="small"
                        icon={view.isFavorite ? <StarFilled /> : <StarOutlined />}
                        onClick={() => handleToggleFavorite(view.id)}
                        className={view.isFavorite ? 'text-yellow-500' : ''}
                      />
                    </Tooltip>,
                    <Tooltip title="Set as default">
                      <Button
                        type="text"
                        size="small"
                        icon={<SettingOutlined />}
                        onClick={() => handleSetDefault(view.id)}
                        className={view.isDefault ? 'text-blue-500' : ''}
                      />
                    </Tooltip>,
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEditView(view)}
                    />,
                    <Popconfirm
                      title="Delete this view?"
                      onConfirm={() => handleDeleteView(view.id)}
                      okText="Delete"
                      cancelText="Cancel"
                      okType="danger"
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                      />
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{view.name}</Text>
                        {view.isDefault && <Tag color="blue">Default</Tag>}
                        {view.isFavorite && <StarFilled className="text-yellow-500" />}
                      </Space>
                    }
                    description={
                      <div className="space-y-2">
                        {view.description && (
                          <Text type="secondary">{view.description}</Text>
                        )}
                        <Space wrap size="small">
                          <Tag icon={<FilterOutlined />} color="blue">
                            {view.filters.length} filters
                          </Tag>
                          <Tag icon={<TableOutlined />} color="green">
                            {view.columns.length} columns
                          </Tag>
                          {view.searchQuery && (
                            <Tag icon={<SearchOutlined />} color="orange">
                              Search: {view.searchQuery}
                            </Tag>
                          )}
                          <Text type="secondary" className="text-xs">
                            {view.createdAt.toLocaleDateString()}
                          </Text>
                        </Space>
                      </div>
                    }
                  />
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleApplyView(view)}
                  >
                    Apply
                  </Button>
                </List.Item>
              )}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ViewsController;