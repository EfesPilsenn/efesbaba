'use client';

import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  useDroppable
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PlusIcon } from '@heroicons/react/24/outline';
import { SortableTask } from './SortableTask';
import { supabase } from '@/utils/supabase';
import type { TodoTable } from '@/utils/supabase';

interface TodoItem {
  id: number;
  text: string;
  status: 'todo' | 'inProgress' | 'done';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

const COLUMNS = {
  todo: 'todo',
  inProgress: 'inProgress',
  done: 'done'
} as const;

function DroppableColumn({ 
  id, 
  title, 
  items, 
  onDelete 
}: { 
  id: string; 
  title: string; 
  items: TodoItem[];
  onDelete: (id: number) => void;
}) {
  const { setNodeRef } = useDroppable({
    id
  });

  return (
    <div 
      ref={setNodeRef}
      className="bg-white/5 backdrop-blur-lg rounded-lg p-4 min-h-[200px]"
    >
      <h2 className="text-lg font-semibold text-white mb-4 text-center">{title}</h2>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map(todo => (
            <SortableTask
              key={todo.id}
              todo={todo}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function Todo(): React.ReactElement {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTodos: TodoItem[] = (data as TodoTable[]).map(todo => ({
        id: todo.id,
        text: todo.text,
        status: todo.status,
        createdAt: new Date(todo.created_at),
        startedAt: todo.started_at ? new Date(todo.started_at) : undefined,
        completedAt: todo.completed_at ? new Date(todo.completed_at) : undefined,
      }));

      setTodos(formattedTodos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      try {
        const newTodo = {
          text: input.trim(),
          status: 'todo' as const,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('todos')
          .insert([newTodo])
          .select()
          .single();

        if (error) throw error;

        const formattedTodo: TodoItem = {
          id: data.id,
          text: data.text,
          status: data.status,
          createdAt: new Date(data.created_at),
        };

        setTodos([formattedTodo, ...todos]);
        setInput('');
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    }
  };

  const deleteTodo = async (id: number): Promise<void> => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const draggedTask = todos.find(t => t.id === active.id);
    if (!draggedTask) return;

    const newStatus = over.id as keyof typeof COLUMNS;
    
    if (newStatus in COLUMNS && newStatus !== draggedTask.status) {
      try {
        const updates: Partial<TodoTable> = { status: newStatus };
        
        if (newStatus === 'inProgress' && !draggedTask.startedAt) {
          updates.started_at = new Date().toISOString();
        }
        
        if (newStatus === 'done' && !draggedTask.completedAt) {
          updates.completed_at = new Date().toISOString();
        }

        const { error } = await supabase
          .from('todos')
          .update(updates)
          .eq('id', draggedTask.id);

        if (error) throw error;

        setTodos(todos.map(t => {
          if (t.id === draggedTask.id) {
            return {
              ...t,
              status: newStatus,
              startedAt: updates.started_at ? new Date(updates.started_at) : t.startedAt,
              completedAt: updates.completed_at ? new Date(updates.completed_at) : t.completedAt,
            };
          }
          return t;
        }));
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    }
  };

  const filterTodosByStatus = (status: TodoItem['status']) => 
    todos.filter(todo => todo.status === status);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(50,50,50,0.2),rgba(0,0,0,0.9))]" />
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_80%_20%,rgba(60,60,60,0.1),transparent_50%)]" />
        <div className="absolute inset-0 animate-pulse delay-1000 bg-[radial-gradient(circle_at_20%_80%,rgba(60,60,60,0.1),transparent_50%)]" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto p-6 mt-10">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Görev Yönetimi</h1>
        
        <form onSubmit={addTodo} className="mb-8">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/25"
              placeholder="Yeni görev ekle..."
              aria-label="Yeni görev"
            />
            <button
              type="submit"
              title="Görev ekle"
              aria-label="Görev ekle"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <PlusIcon className="w-5 h-5 text-white" aria-hidden="true" />
            </button>
          </div>
        </form>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DroppableColumn
              id="todo"
              title="Yapılacak"
              items={filterTodosByStatus('todo')}
              onDelete={deleteTodo}
            />
            <DroppableColumn
              id="inProgress"
              title="Yapılıyor"
              items={filterTodosByStatus('inProgress')}
              onDelete={deleteTodo}
            />
            <DroppableColumn
              id="done"
              title="Tamamlandı"
              items={filterTodosByStatus('done')}
              onDelete={deleteTodo}
            />
          </div>
        </DndContext>
      </div>

      <style jsx global>{`
        @keyframes gradient-shift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-10px, -10px); }
          100% { transform: translate(0, 0); }
        }
        .animate-pulse {
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>
    </div>
  );
} 