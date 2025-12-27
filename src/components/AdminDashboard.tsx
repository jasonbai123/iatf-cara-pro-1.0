import React, { useState, useEffect } from 'react';
import { authService, User } from '../services/auth.service';
import { logger } from '../shared/utils/logger';
import { TrashIcon, XMarkIcon, UserIcon, PencilIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { UserType } from '../types/auth.types';

interface AdminDashboardProps {
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ userType: string; expiryDate: string }>({
    userType: '',
    expiryDate: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userList = await authService.getAllUsers();
      setUsers(userList);
    } catch (error) {
      logger.error('加载用户列表失败:', error);
      alert('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('确定要删除该用户吗？此操作不可恢复。')) {
      return;
    }

    try {
      setDeletingUserId(userId);
      const success = await authService.deleteUser(userId);
      
      if (success) {
        setUsers(users.filter(user => user.id !== userId));
        alert('用户删除成功');
      } else {
        alert('用户删除失败');
      }
    } catch (error) {
      logger.error('删除用户失败:', error);
      alert('删除用户失败，请稍后重试');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditForm({
      userType: user.userType,
      expiryDate: user.expiryDate ? new Date(user.expiryDate).toISOString().split('T')[0] : ''
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditForm({ userType: '', expiryDate: '' });
  };

  const handleSaveEdit = async (userId: string) => {
    try {
      const expiryDate = editForm.userType === 'premium' || editForm.userType === 'admin' ? null : editForm.expiryDate;
      const success = await authService.updateUserType(userId, editForm.userType, expiryDate || undefined);
      
      if (success) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                userType: editForm.userType as any,
                expiryDate: expiryDate 
              }
            : user
        ));
        setEditingUserId(null);
        alert('用户类型更新成功');
      } else {
        alert('用户类型更新失败');
      }
    } catch (error) {
      logger.error('更新用户类型失败:', error);
      alert('更新用户类型失败，请稍后重试');
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'admin':
        return '管理员';
      case 'premium':
        return '正式用户';
      case 'trial':
        return '试用用户';
      default:
        return userType;
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'premium':
        return 'bg-green-100 text-green-700';
      case 'trial':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRemainingDays = (user: User) => {
    if (user.userType === 'premium' || user.userType === 'admin') {
      return '永久';
    }
    
    if (!user.expiryDate) {
      return '已过期';
    }
    
    const expiryDate = new Date(user.expiryDate);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return '已过期';
    }
    
    return `${diffDays} 天`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">系统管理员控制台</h2>
            <p className="text-sm text-gray-600 mt-1">管理用户、权限和系统设置</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">加载中...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无用户</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.nickname}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-800">{user.nickname || '未设置昵称'}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUserTypeColor(user.userType)}`}>
                          {getUserTypeLabel(user.userType)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{user.phone}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>注册时间: {new Date(user.createdAt).toLocaleString('zh-CN')}</span>
                        <span>剩余时间: {getRemainingDays(user)}</span>
                      </div>
                      {user.wechatOpenId && (
                        <p className="text-xs text-green-600 mt-1">
                          已绑定微信
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {editingUserId === user.id ? (
                      <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                        <select
                          value={editForm.userType}
                          onChange={(e) => setEditForm({ ...editForm, userType: e.target.value })}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="trial">试用用户</option>
                          <option value="premium">正式用户</option>
                          <option value="admin">管理员</option>
                        </select>
                        {editForm.userType === 'trial' && (
                          <input
                            type="date"
                            value={editForm.expiryDate}
                            onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        )}
                        <button
                          onClick={() => handleSaveEdit(user.id)}
                          className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="保存"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          title="取消"
                        >
                          <XCircleIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(user)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="编辑用户"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deletingUserId === user.id || user.userType === 'admin'}
                          className={`p-2 rounded-lg transition-colors ${
                            deletingUserId === user.id || user.userType === 'admin'
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                          title={user.userType === 'admin' ? '无法删除管理员' : '删除用户'}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>共 {users.length} 位用户</span>
              <span className="text-blue-600">
                管理员: {users.filter(u => u.userType === 'admin').length}
              </span>
              <span className="text-green-600">
                正式用户: {users.filter(u => u.userType === 'premium').length}
              </span>
              <span className="text-blue-600">
                试用用户: {users.filter(u => u.userType === 'trial').length}
              </span>
            </div>
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              刷新列表
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
