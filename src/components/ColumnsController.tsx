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
      className={`relative flex items-center justify-between py-3 px-4 mx-2 my-1 rounded-lg transition-all duration-200 group ${
        isDragging 
          ? 'bg-blue-900/50 border border-blue-600 shadow-lg z-10' 
          : 'hover:bg-gray-700/50 border border-transparent hover:border-gray-600'
      }`}
    >
      {/* Professional Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-300 transition-colors duration-200 p-1.5 rounded hover:bg-gray-600"
      >
        <HolderOutlined className="text-base" />
      </div>
      
      <div className="flex items-center gap-4 flex-1 ml-2">
        {/* Column Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${
              isBase 
                ? 'text-blue-400' 
                : 'text-gray-200'
            }`}>
              {displayName}
            </span>
            {isBase && (
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-md font-medium">
                Core
              </span>
            )}
          </div>
        </div>

        {/* Professional Toggle */}
        <Button
          type="text"
          size="small"
          icon={isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          onClick={onToggle}
          className={`w-9 h-9 rounded-lg border-0 transition-all duration-200 ${
            isVisible 
              ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30' 
              : 'text-gray-500 hover:text-gray-400 hover:bg-gray-700'
          }`}
        />
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

  // Professional dropdown content with drag and drop
  const dropdownContent = (
    <div className="w-96 max-h-96 bg-gray-800 rounded-xl shadow-2xl border border-gray-600 overflow-hidden">
      {/* Professional Header */}
      <div className="px-5 py-4 bg-gray-750 border-b border-gray-600">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <TableOutlined className="text-emerald-400 text-lg" />
            <div>
              <Text className="text-base font-semibold text-white">
                Column Manager
              </Text>
              <div className="text-sm text-gray-400">
                Drag to reorder • Toggle visibility
              </div>
            </div>
          </div>
          
          <Button 
            size="small" 
            type="text"
            onClick={onResetColumns}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md border-0 font-medium transition-all duration-200"
          >
            Reset All
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 border border-emerald-600/30 rounded-lg">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
            <span className="text-emerald-300 font-medium text-sm">{visibleColumns.length} visible</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/30 border border-blue-600/30 rounded-lg">
            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
            <span className="text-blue-300 font-medium text-sm">{allColumns.length} total</span>
          </div>
        </div>
      </div>

      {/* Professional Column List */}
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
        className="bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-md px-3 py-2 h-9 flex items-center gap-2 text-sm font-medium transition-all duration-200 shadow-sm"
        title={`Columns (${visibleColumns.length} of ${allColumns.length} visible)`}
        onClick={(e) => e.stopPropagation()}
      >
        <TableOutlined className="text-sm" />
        <span>Columns</span>
        <div className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
          {visibleColumns.length}
        </div>
      </Button>
    </Dropdown>
  );
};

export default ColumnsController;