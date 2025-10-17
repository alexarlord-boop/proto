import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string | null
  components: any[]
  developer_id: string
  created_at: string
  updated_at: string
}

interface ProjectManagerProps {
  onNavigate: (path: string) => void
}

export function ProjectManager({ onNavigate }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/projects')
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  // Create new project
  const handleCreate = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          components: [],
          developer_id: 'default',
        }),
      })
      
      if (response.ok) {
        const newProject = await response.json()
        setProjects([newProject, ...projects])
        setShowCreateDialog(false)
        setFormData({ name: '', description: '' })
        
        // Navigate to the new project
        onNavigate(`/editor/${newProject.id}`)
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  // Update project
  const handleUpdate = async () => {
    if (!editingProject) return
    
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      })
      
      if (response.ok) {
        const updatedProject = await response.json()
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p))
        setEditingProject(null)
        setFormData({ name: '', description: '' })
      }
    } catch (error) {
      console.error('Failed to update project:', error)
    }
  }

  // Delete project
  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId))
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  // Open edit dialog
  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setFormData({ name: project.name, description: project.description || '' })
  }

  // Open project in editor
  const handleOpen = (projectId: string) => {
    onNavigate(`/editor/${projectId}`)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-slate-800 text-white px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Proto Projects</h1>
            <p className="text-slate-300 text-sm mt-1">Manage your canvas projects and queries</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => onNavigate('/query-creator')}
              variant="outline"
              className="bg-slate-700 border-slate-600 hover:bg-slate-600"
            >
              Query Creator
            </Button>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No projects yet</h3>
              <p className="text-slate-500 mb-4">Create your first canvas project to get started</p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px] text-center">Components</TableHead>
                    <TableHead className="w-[180px]">Last Updated</TableHead>
                    <TableHead className="w-[180px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell className="text-slate-600">
                        {project.description || <span className="italic text-slate-400">No description</span>}
                      </TableCell>
                      <TableCell className="text-center text-slate-600">
                        {project.components?.length || 0}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {formatDate(project.updated_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleOpen(project.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
                            Open
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(project)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(project.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      {(showCreateDialog || editingProject) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter project description (optional)"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false)
                  setEditingProject(null)
                  setFormData({ name: '', description: '' })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingProject ? handleUpdate : handleCreate}
                disabled={!formData.name.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingProject ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

