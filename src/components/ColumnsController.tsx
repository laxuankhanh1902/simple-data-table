import React, { useState } from 'react';
import { Button, Dropdown, Checkbox, Space, Divider, Typography } from 'antd';
import { TableOutlined, EyeOutlined, EyeInvisibleOutlined, HolderOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

const { Text } = Typography;

interface ColumnsControllerProps {
  allColumns: string[];
  visibleColumns: string[];
  baseColumns: string[];
  onToggleColumn: (column: string, visible: boolean) => void;
  onResetColumns: () => void;
  onReorderColumns?: (newOrder: string[]) => void;
}

// Sortable Item Component
interface SortableColumnItemProps {
  column: string;
  isVisible: boolean;
  isBase: boolean;
  displayName: string;
  onToggle: () => void;
}

const SortableColumnItem: React.FC<SortableColumnItemProps> = ({
  column,
  isVisible,
  isBase,
  displayName,
  onToggle,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 ${
        isDragging ? 'z-10' : ''
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <HolderOutlined />
        </div>
        <Checkbox checked={isVisible} onChange={onToggle} />
        <span className={`text-sm ${isBase ? 'font-medium text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
          {displayName}
        </span>
        {isBase && (
          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
            Base
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isVisible ? (
          <EyeOutlined className="text-green-500 text-xs" />
        ) : (
          <EyeInvisibleOutlined className="text-gray-400 text-xs" />
        )}
      </div>
    </div>
  );
};

const ColumnsController: React.FC<ColumnsControllerProps> = ({
  allColumns,
  visibleColumns,
  baseColumns,
  onToggleColumn,
  onResetColumns,
  onReorderColumns
}) => {
  const [open, setOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getColumnDisplayName = (column: string) => {
    const displayNames: Record<string, string> = {
      'id': 'ID',
      'timestamp': 'Timestamp',
      'user': 'User',
      'user.email': 'Email',
      'status': 'Status',
      'priority': 'Priority',
      'score': 'Score',
      'revenue': 'Revenue',
      'activity.type': 'Activity',
      'tags': 'Tags',
    };
    return displayNames[column] || column.split('.').pop() || column;
  };

  const isColumnVisible = (column: string) => visibleColumns.includes(column);

  const handleToggleColumn = (column: string) => {
    const isVisible = isColumnVisible(column);
    onToggleColumn(column, !isVisible);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && onReorderColumns) {
      const oldIndex = allColumns.indexOf(active.id as string);
      const newIndex = allColumns.indexOf(over?.id as string);

      const newOrder = arrayMove(allColumns, oldIndex, newIndex);
      onReorderColumns(newOrder);
    }
  };

  // Custom dropdown content with drag and drop
  const dropdownContent = (
    <div className="w-80 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <Text strong className="text-sm dark:text-white">Column Management</Text>
          <Button 
            size="small" 
            type="link" 
            onClick={onResetColumns}
            className="text-xs p-0 h-auto text-blue-600 hover:text-blue-800"
          >
            Reset
          </Button>
        </div>
        <Text type="secondary" className="text-xs dark:text-gray-400">
          {visibleColumns.length} of {allColumns.length} columns visible • Drag to reorder
        </Text>
      </div>

      {/* Sortable Column List */}
      <div className="overflow-y-auto max-h-80">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={allColumns} strategy={verticalListSortingStrategy}>
            {allColumns.map(column => (
              <SortableColumnItem
                key={column}
                column={column}
                isVisible={isColumnVisible(column)}
                isBase={baseColumns.includes(column)}
                displayName={getColumnDisplayName(column)}
                onToggle={() => handleToggleColumn(column)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomLeft"
    >
      <Button
        type="text"
        icon={<TableOutlined />}
        className="rounded-lg p-2 relative border"
        style={{
          color: 'var(--text-secondary)',
          borderColor: 'var(--border-color)',
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = 'var(--accent-color)';
          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title={`Manage Columns (${visibleColumns.length} visible)`}
        onClick={(e) => e.stopPropagation()}
      >
        <span 
          className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full font-medium min-w-[20px] text-center"
          style={{
            backgroundColor: 'var(--accent-color)',
            color: 'white',
            border: '2px solid var(--bg-primary)',
            fontSize: '10px',
            fontWeight: 'bold'
          }}
        >
          {visibleColumns.length}
        </span>
      </Button>
    </Dropdown>
  );
};

export default ColumnsController;