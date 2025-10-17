import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Copy, Check, Eye, EyeOff, Key, Power, PowerOff, AlertTriangle } from 'lucide-react';

interface APIKey {
  id: string;
  key: string;
  name: string;
  project_id: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface APIKeyManagerProps {
  projectId: string;
  projectName: string;
}

export function APIKeyManager({ projectId, projectName }: APIKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAPIKeys();
  }, [projectId]);

  const loadAPIKeys = async () => {
    setLoading(true);
    try {
      const keys = await apiClient.get<APIKey[]>(`/api/projects/${projectId}/api-keys`);
      setApiKeys(keys);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    try {
      await apiClient.post(`/api/projects/${projectId}/api-keys`, {
        name: newKeyName,
        project_id: projectId,
        expires_in_days: expiresInDays || null,
      });
      
      setNewKeyName('');
      setExpiresInDays(undefined);
      setShowCreateForm(false);
      loadAPIKeys();
    } catch (error: any) {
      console.error('Failed to create API key:', error);
      alert(`Failed to create API key: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeactivateKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Deactivate API key "${keyName}"?\n\nThis will stop it from working immediately but keep it for your records. You can reactivate it later.`)) {
      return;
    }

    try {
      await apiClient.patch(`/api/projects/${projectId}/api-keys/${keyId}/deactivate`, {});
      loadAPIKeys();
    } catch (error: any) {
      console.error('Failed to deactivate API key:', error);
      alert(`Failed to deactivate API key: ${error.message || 'Unknown error'}`);
    }
  };

  const handleActivateKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Reactivate API key "${keyName}"?\n\nThis will make it work again immediately.`)) {
      return;
    }

    try {
      await apiClient.patch(`/api/projects/${projectId}/api-keys/${keyId}/activate`, {});
      loadAPIKeys();
    } catch (error: any) {
      console.error('Failed to activate API key:', error);
      alert(`Failed to activate API key: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteKey = async (keyId: string, keyName: string) => {
    if (!confirm(`⚠️ PERMANENTLY DELETE API key "${keyName}"?\n\nThis action CANNOT be undone!\n\nThe key will be removed from the database permanently.\n\nIf you just want to stop it from working, use "Deactivate" instead.`)) {
      return;
    }

    try {
      await apiClient.delete(`/api/projects/${projectId}/api-keys/${keyId}`);
      loadAPIKeys();
    } catch (error: any) {
      console.error('Failed to delete API key:', error);
      alert(`Failed to delete API key: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCopyKey = (keyId: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const maskKey = (key: string) => {
    return `${key.substring(0, 8)}${'•'.repeat(20)}${key.substring(key.length - 4)}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
          <span className="text-sm text-gray-500">({apiKeys.length})</span>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showCreateForm ? 'Cancel' : 'Create Key'}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Create New API Key</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Name
              </label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production Export, Demo Dashboard"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires In (days) - Optional
              </label>
              <Input
                type="number"
                value={expiresInDays || ''}
                onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Leave empty for no expiration"
                min="1"
              />
            </div>
            <Button
              onClick={handleCreateKey}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Generate API Key
            </Button>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading API keys...</div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-2">No API keys yet</p>
            <p className="text-sm text-gray-400">
              API keys are automatically created when you export with "Live + Public" mode,
              or you can create them manually here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => {
              const isVisible = visibleKeys.has(key.id);
              const isExpired = key.expires_at && new Date(key.expires_at) < new Date();
              const isCopied = copiedKeyId === key.id;

              return (
                <div
                  key={key.id}
                  className={`p-4 border rounded-lg ${
                    isExpired 
                      ? 'border-red-200 bg-red-50' 
                      : !key.is_active 
                      ? 'border-gray-300 bg-gray-100 opacity-75' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${!key.is_active ? 'text-gray-500' : 'text-gray-900'}`}>
                          {key.name}
                        </h4>
                        {isExpired && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                            Expired
                          </span>
                        )}
                        {!key.is_active && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-300 text-gray-700 rounded flex items-center gap-1">
                            <PowerOff className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                        {key.is_active && !isExpired && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded flex items-center gap-1">
                            <Power className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 font-mono">
                          {isVisible ? key.key : maskKey(key.key)}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title={isVisible ? 'Hide key' : 'Show key'}
                        >
                          {isVisible ? (
                            <EyeOff className="w-4 h-4 text-gray-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Created: {new Date(key.created_at).toLocaleString()}
                        {key.expires_at && (
                          <span className="ml-3">
                            Expires: {new Date(key.expires_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        onClick={() => handleCopyKey(key.id, key.key)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        disabled={!key.is_active}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </Button>
                      
                      {key.is_active && !isExpired ? (
                        <Button
                          onClick={() => handleDeactivateKey(key.id, key.name)}
                          size="sm"
                          variant="outline"
                          className="bg-orange-50 border-orange-300 hover:bg-orange-100"
                          title="Deactivate (can be reactivated later)"
                        >
                          <PowerOff className="w-4 h-4 text-orange-600" />
                        </Button>
                      ) : !isExpired ? (
                        <Button
                          onClick={() => handleActivateKey(key.id, key.name)}
                          size="sm"
                          variant="outline"
                          className="bg-green-50 border-green-300 hover:bg-green-100"
                          title="Reactivate this key"
                        >
                          <Power className="w-4 h-4 text-green-600" />
                        </Button>
                      ) : null}
                      
                      <Button
                        onClick={() => handleDeleteKey(key.id, key.name)}
                        size="sm"
                        variant="destructive"
                        title="Permanently delete (cannot be undone)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
            <p className="font-medium mb-1">About API Keys</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>API keys allow public access to exported projects with live data</li>
              <li>Keys are scoped to this project only</li>
              <li><strong>Deactivate</strong> to temporarily disable (keeps audit trail)</li>
              <li><strong>Delete</strong> to permanently remove (cannot be undone)</li>
              <li>When exporting, the most recent active key is reused</li>
              <li>New key is only created if no active keys exist</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

