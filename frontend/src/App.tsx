import { DnDEditor } from "@/components/Editor/DnDEditor.tsx"
import { QueryCreator } from "@/components/QueryCreator/QueryCreator.tsx"
import { ProjectManager } from "@/components/ProjectManager/ProjectManager.tsx"
import { LoginPage } from "@/components/Auth/LoginPage.tsx"
import { InitAdminPage } from "@/components/Auth/InitAdminPage.tsx"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api-client"
import { useState, useEffect } from "react"

function AppContent() {
    const { isAuthenticated, isLoading, authStatus } = useAuth()
    const [currentPath, setCurrentPath] = useState(window.location.pathname)
    const [projectId, setProjectId] = useState<string | undefined>()
    const [projectName, setProjectName] = useState<string | undefined>()

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

    // Parse route and extract project ID if present
    const parseRoute = (path: string) => {
        const match = path.match(/^\/editor\/([a-f0-9-]+)$/)
        if (match) {
            const id = match[1]
            setProjectId(id)
            loadProjectName(id)
        } else {
            setProjectId(undefined)
            setProjectName(undefined)
        }
    }

    // Load project name for display
    const loadProjectName = async (id: string) => {
        try {
            const project = await apiClient.get(`/api/projects/${id}`)
            setProjectName(project.name)
        } catch (error) {
            console.error('Failed to load project name:', error)
        }
    }

    // Simple navigation function
    const navigate = (path: string) => {
        window.history.pushState({}, '', path)
        setCurrentPath(path)
        parseRoute(path)
    }

    // Show loading state
    if (isLoading) {
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

    // Show login if not authenticated
    if (!isAuthenticated) {
        return <LoginPage />
    }

    // Route to query creator
    if (currentPath === '/query-creator') {
        return <QueryCreator />
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