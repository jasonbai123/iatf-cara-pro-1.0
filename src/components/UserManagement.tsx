import React, { useState, useEffect } from 'react';
import { authService, User } from '../services/auth.service';
import { logger } from '../shared/utils/logger';
import { TrashIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';

interface UserManagementProps {
  onClose: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">用户管理</h2>
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
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
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
                    <div>
                      <p className="font-medium text-gray-800">{user.nickname || '未设置昵称'}</p>
                      <p className="text-sm text-gray-600">{user.phone}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        注册时间: {new Date(user.createdAt).toLocaleString('zh-CN')}
                      </p>
                      {user.wechatOpenId && (
                        <p className="text-xs text-green-600 mt-1">
                          已绑定微信
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={deletingUserId === user.id}
                    className={`p-2 rounded-lg transition-colors ${
                      deletingUserId === user.id
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                    title="删除用户"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>共 {users.length} 位用户</span>
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

export default UserManagement;