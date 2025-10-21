import { DnDEditor } from "@/components/Editor/DnDEditor.tsx"
import { QueryCreator } from "@/components/QueryCreator/QueryCreator.tsx"
import { ProjectManager } from "@/components/ProjectManager/ProjectManager.tsx"
import { LoginPage } from "@/components/Auth/LoginPage.tsx"
import { InitAdminPage } from "@/components/Auth/InitAdminPage.tsx"
import { UserManagement } from "@/components/Admin/UserManagement.tsx"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api-client"
import { useState, useEffect } from "react"

function AppContent() {
    const { isAuthenticated, isLoading, authStatus } = useAuth()
    const [currentPath, setCurrentPath] = useState(window.location.pathname)
    const [projectId, setProjectId] = useState<string | undefined>()
    const [projectName, setProjectName] = useState<string | undefined>()
    const [projectAccessError, setProjectAccessError] = useState<string | null>(null)
    const [isCheckingProjectAccess, setIsCheckingProjectAccess] = useState(false)
    const [projectAccessChecked, setProjectAccessChecked] = useState(false)

    useEffect(() => {
        // Listen for popstate events (browser back/forward)
        const handlePopState = () => {
            setCurrentPath(window.location.pathname)
            parseRoute(window.location.pathname)
        }
        
        window.addEventListener('popstate', handlePopState)
        parseRoute(window.location.pathname)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    // Check project access when authentication status changes
    useEffect(() => {
        if (isAuthenticated && projectId && !projectAccessChecked) {
            loadProjectName(projectId)
        }
    }, [isAuthenticated, projectId, projectAccessChecked])

    // Parse route and extract project ID if present
    const parseRoute = (path: string) => {
        const match = path.match(/^\/editor\/([a-f0-9-]+)$/)
        if (match) {
            const id = match[1]
            setProjectId(id)
            setProjectAccessChecked(false) // Reset access check when route changes
            // Only load project if user is authenticated
            if (isAuthenticated) {
                loadProjectName(id)
            }
        } else {
            setProjectId(undefined)
            setProjectName(undefined)
            setProjectAccessError(null)
            setProjectAccessChecked(false)
        }
    }

    // Load project name for display and check access
    const loadProjectName = async (id: string) => {
        setIsCheckingProjectAccess(true)
        try {
            const project = await apiClient.get(`/api/projects/${id}`)
            setProjectName(project.name)
            setProjectAccessError(null)
            setProjectAccessChecked(true)
        } catch (error: any) {
            console.error('Failed to load project name:', error)
            if (error.response?.status === 403) {
                setProjectAccessError(error.response.data?.detail || 'You don\'t have permission to access this project.')
            } else {
                setProjectAccessError('Failed to load project. Please try again.')
            }
            setProjectAccessChecked(true)
        } finally {
            setIsCheckingProjectAccess(false)
        }
    }

    // Simple navigation function
    const navigate = (path: string) => {
        window.history.pushState({}, '', path)
        setCurrentPath(path)
        parseRoute(path)
    }

    // Show loading state
    if (isLoading || isCheckingProjectAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-slate-600">Loading...</div>
            </div>
        )
    }

    // Show admin initialization if no admin exists
    if (authStatus?.requires_init) {
        return <InitAdminPage />
    }

    // Show login if not authenticated OR if user has project access error
    if (!isAuthenticated || projectAccessError) {
        return (
            <LoginPage 
                projectAccessError={projectAccessError}
            />
        )
    }

    // For editor routes, ensure project access has been checked
    if (currentPath.startsWith('/editor/') && !projectAccessChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-slate-600">Checking project access...</div>
            </div>
        )
    }

    // Route to query creator
    if (currentPath === '/query-creator') {
        return <QueryCreator />
    }

    // Route to admin user management
    if (currentPath === '/admin/users') {
        return <UserManagement />
    }

    // Route to project editor
    if (currentPath.startsWith('/editor/')) {
        return (
            <DnDEditor 
                projectId={projectId}
                projectName={projectName}
                onNavigate={navigate}
            />
        )
    }

    // Default route - home page with project manager
    return <ProjectManager onNavigate={navigate} />
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}

export default App