import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Trash2, UserPlus, Users as UsersIcon, Shield } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
}

interface ProjectShare {
  id: string;
  project_id: string;
  user_id: string;
  permission: string;
  created_at: string;
}

interface ProjectShareWithUser extends ProjectShare {
  user?: User;
}

interface ProjectShareManagerProps {
  projectId: string;
  projectName: string;
  projectOwnerId: string;
}

export function ProjectShareManager({ projectId, projectOwnerId }: ProjectShareManagerProps) {
  const [shares, setShares] = useState<ProjectShareWithUser[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedPermission] = useState<'view'>('view');

  useEffect(() => {
    loadShares();
    loadUsers();
  }, [projectId]);

  const loadShares = async () => {
    setLoading(true);
    try {
      const sharesData = await apiClient.get<ProjectShare[]>(`/api/projects/${projectId}/shares`);
      setShares(sharesData);
    } catch (error) {
      console.error('Failed to load project shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await apiClient.get<User[]>('/api/users');
      setAllUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleAddShare = async () => {
    if (!selectedUserId) {
      alert('Please select a user');
      return;
    }

    // Check if already shared with this user
    if (shares.some(s => s.user_id === selectedUserId)) {
      alert('This project is already shared with this user');
      return;
    }

    try {
      await apiClient.post(`/api/projects/${projectId}/share`, {
        project_id: projectId,
        user_id: selectedUserId,
        permission: selectedPermission,
      });
      
      setSelectedUserId('');
      setShowAddForm(false);
      loadShares();
    } catch (error: any) {
      console.error('Failed to share project:', error);
      alert(`Failed to share project: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRemoveShare = async (shareId: string, username: string) => {
    if (!confirm(`Remove access for "${username}"?\n\nThey will no longer be able to view this project's exported dashboards.`)) {
      return;
    }

    try {
      await apiClient.delete(`/api/projects/${projectId}/shares/${shareId}`);
      loadShares();
    } catch (error: any) {
      console.error('Failed to remove share:', error);
      alert(`Failed to remove share: ${error.message || 'Unknown error'}`);
    }
  };

  // Get available users (not already shared with, and not the owner)
  const availableUsers = allUsers.filter(
    user => user.id !== projectOwnerId && !shares.some(s => s.user_id === user.id)
  );

  // Enrich shares with user info
  const enrichedShares = shares.map(share => ({
    ...share,
    user: allUsers.find(u => u.id === share.user_id),
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Shared With</h3>
          <span className="text-sm text-gray-500">({shares.length} users)</span>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={availableUsers.length === 0}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {showAddForm ? 'Cancel' : 'Share'}
        </Button>
      </div>

      {/* Add Share Form */}
      {showAddForm && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Share Project</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a user...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email})
                    {user.is_admin && ' - Admin'}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-blue-800">View Only Access</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Shared users can only view exported dashboards, not edit the project
              </p>
            </div>
            <Button
              onClick={handleAddShare}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!selectedUserId}
            >
              Share Project
            </Button>
          </div>
        </div>
      )}

      {/* Shares List */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading shared users...</div>
        ) : enrichedShares.length === 0 ? (
          <div className="text-center py-8">
            <UsersIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-2">Not shared with anyone yet</p>
            <p className="text-sm text-gray-400">
              Share this project to allow other users to access exported dashboards with "Protected" mode
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {enrichedShares.map((share) => {
              const user = share.user;
              if (!user) return null;

              return (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{user.username}</h4>
                        {user.is_admin && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
                        View Only
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        Shared {new Date(share.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRemoveShare(share.id, user.username)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border-t border-blue-200">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">How Project Sharing Works</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Only affects <strong>Protected exports</strong> (login required)</li>
              <li>Shared users can login and view the exported dashboard</li>
              <li>They use their own Proto credentials</li>
              <li>Remove access anytime to revoke permissions</li>
              <li><strong>Public exports</strong> (API key) don't check user access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

