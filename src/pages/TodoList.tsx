import { useState, useEffect } from 'react';
import { todoApi, TodoGroup, TodoItem } from '../api/v3Api';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  FolderPlus,
  Check,
  Folder
} from 'lucide-react';

export default function TodoList() {
  const [groups, setGroups] = useState<TodoGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<TodoGroup | null>(null);
  const [_loading, setLoading] = useState(false);

  // New Group modal / state
  const [newGroupName, setNewGroupName] = useState('');
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);

  // New Item state
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [newItemDueDate, setNewItemDueDate] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await todoApi.getGroups();
      if (res.success) {
        const loadedGroups: TodoGroup[] = res.data || [];
        setGroups(loadedGroups);

        if (loadedGroups.length > 0) {
          if (!activeGroup) {
            setActiveGroup(loadedGroups[0]);
          } else {
            const updatedActive = loadedGroups.find(g => g.id === activeGroup.id);
            setActiveGroup(updatedActive || loadedGroups[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load todo groups', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const res = await todoApi.createGroup({ name: newGroupName.trim() });
      if (res.success) {
        setNewGroupName('');
        setShowAddGroupModal(false);
        await loadGroups();
      }
    } catch (err) {
      console.error('Failed to create group', err);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('确定删除该分组及其包含的所有待办事项吗？')) return;
    try {
      await todoApi.deleteGroup(groupId);
      setActiveGroup(null);
      await loadGroups();
    } catch (err) {
      console.error('Failed to delete group', err);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !newItemTitle.trim()) return;

    try {
      const res = await todoApi.createItem({
        groupId: activeGroup.id,
        title: newItemTitle.trim(),
        notes: newItemNotes.trim() || undefined,
        dueDate: newItemDueDate || undefined
      });

      if (res.success) {
        setNewItemTitle('');
        setNewItemNotes('');
        setNewItemDueDate('');
        await loadGroups();
      }
    } catch (err) {
      console.error('Failed to create todo item', err);
    }
  };

  const handleToggleItem = async (item: TodoItem) => {
    try {
      const res = await todoApi.toggleItem(item.id);
      if (res.success) {
        await loadGroups();
      }
    } catch (err) {
      console.error('Failed to toggle item', err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await todoApi.deleteItem(itemId);
      await loadGroups();
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  const activeItems = activeGroup?.items || [];
  const completedCount = activeItems.filter(i => i.isCompleted).length;
  const progressPercent = activeItems.length > 0 ? Math.round((completedCount / activeItems.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-amber-200/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <CheckSquare size={24} />
            </span>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">TodoList 分组待办事项</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            按业务分组高效管理待办任务（BAS 报税、清洁采购、站点维护等）
          </p>
        </div>

        <button
          onClick={() => setShowAddGroupModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition shadow-md shadow-amber-500/20"
        >
          <FolderPlus size={16} />
          新建一级分组
        </button>
      </div>

      {/* Main Layout: Left Sidebar Groups + Right Item List */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Groups Sidebar */}
        <div className="md:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>待办分组 ({groups.length})</span>
          </div>

          <div className="space-y-1">
            {groups.map((g) => (
              <div
                key={g.id}
                onClick={() => setActiveGroup(g)}
                className={`group flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-xs transition cursor-pointer ${
                  activeGroup?.id === g.id
                    ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-700 hover:bg-amber-50 hover:text-amber-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder size={16} className={activeGroup?.id === g.id ? 'text-amber-100' : 'text-amber-500'} />
                  <span className="truncate">{g.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeGroup?.id === g.id ? 'bg-amber-600 text-amber-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {g.completedCount}/{g.totalCount}
                  </span>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Tasks Content */}
        <div className="md:col-span-3 space-y-6">
          {activeGroup ? (
            <>
              {/* Active Group Progress & Title */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{activeGroup.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      已完成 {completedCount} / {activeItems.length} 项 ({progressPercent}%)
                    </p>
                  </div>

                  {/* Circular / Line Progress */}
                  <div className="w-36">
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Add Task Input Form */}
                <form onSubmit={handleCreateItem} className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      required
                      placeholder="添加新待办事项标题..."
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                    />

                    <input
                      type="date"
                      value={newItemDueDate}
                      onChange={(e) => setNewItemDueDate(e.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 text-slate-600"
                    />

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition shadow-md shadow-amber-500/20 whitespace-nowrap"
                    >
                      <Plus size={16} />
                      添加待办
                    </button>
                  </div>
                </form>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 divide-y divide-slate-100">
                {activeItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <CheckSquare size={36} className="mx-auto text-slate-300" />
                    <p className="text-xs">该分组下暂无待办事项，输入上方输入框新增待办。</p>
                  </div>
                ) : (
                  activeItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start justify-between gap-4 p-3.5 rounded-xl transition ${
                        item.isCompleted ? 'bg-slate-50/70 opacity-60' : 'hover:bg-amber-50/40'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => handleToggleItem(item)}
                          className={`mt-0.5 p-1 rounded-lg border transition ${
                            item.isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 hover:border-amber-500 bg-white text-transparent'
                          }`}
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>

                        <div className="space-y-1">
                          <h4 className={`text-sm font-semibold text-slate-800 ${
                            item.isCompleted ? 'line-through text-slate-400' : ''
                          }`}>
                            {item.title}
                          </h4>

                          {item.notes && (
                            <p className="text-xs text-slate-500">{item.notes}</p>
                          )}

                          {item.dueDate && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium pt-1">
                              <Calendar size={12} />
                              截止日期：{new Date(item.dueDate).toLocaleDateString('en-AU')}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-slate-300 hover:text-red-600 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400">
              请选择或创建一个待办分组
            </div>
          )}
        </div>
      </div>

      {/* New Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateGroup} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800">新建一级待办分组</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">分组名称 (如：BAS 报税, 清洁采购)</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="输入分组名称"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddGroupModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600"
              >
                创建分组
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
