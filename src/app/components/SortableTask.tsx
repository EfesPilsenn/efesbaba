'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TrashIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface TodoItem {
  id: number;
  text: string;
  status: 'todo' | 'inProgress' | 'done';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface Props {
  todo: TodoItem;
  onDelete: (id: number) => void;
}

export function SortableTask({ todo, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    data: {
      type: 'task',
      todo
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusColor = (status: TodoItem['status']) => {
    switch (status) {
      case 'todo':
        return 'border-yellow-500/30';
      case 'inProgress':
        return 'border-blue-500/30';
      case 'done':
        return 'border-green-500/30';
      default:
        return 'border-gray-500/30';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isDragging ? 0.8 : 1,
          scale: isDragging ? 1.05 : 1,
          rotate: isDragging ? 1 : 0,
          boxShadow: isDragging 
            ? "0 8px 20px rgba(0, 0, 0, 0.2)" 
            : "0 0 0 rgba(0, 0, 0, 0)",
        }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        transition={{
          duration: 0.2,
          type: "spring",
          stiffness: 400,
          damping: 30
        }}
        className={`group flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg rounded-lg hover:bg-white/15 cursor-move border ${
          getStatusColor(todo.status)
        } transition-shadow`}
      >
        <div className="flex flex-col flex-grow">
          <span className="text-white">{todo.text}</span>
          <div className="flex flex-col mt-2 space-y-1">
            <span className="text-xs text-gray-400">
              Oluşturulma: {new Date(todo.createdAt).toLocaleString('tr-TR')}
            </span>
            {todo.startedAt && (
              <span className="text-xs text-blue-400">
                Başlangıç: {new Date(todo.startedAt).toLocaleString('tr-TR')}
              </span>
            )}
            {todo.completedAt && (
              <span className="text-xs text-green-400">
                Tamamlanma: {new Date(todo.completedAt).toLocaleString('tr-TR')}
              </span>
            )}
          </div>
        </div>
        <motion.button
          onClick={() => onDelete(todo.id)}
          type="button"
          title="Görevi sil"
          aria-label="Görevi sil"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-full transition-all"
        >
          <TrashIcon className="w-5 h-5 text-red-500" aria-hidden="true" />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
} 