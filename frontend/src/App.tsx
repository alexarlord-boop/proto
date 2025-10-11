import { DnDEditor } from "@/components/Editor/DnDEditor.tsx"
import { QueryCreator } from "@/components/QueryCreator/QueryCreator.tsx"
import { ProjectManager } from "@/components/ProjectManager/ProjectManager.tsx"
import { useState, useEffect } from "react"

function App() {
    // Simple routing based on pathname
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
            const response = await fetch(`http://localhost:8000/api/projects/${id}`)
            if (response.ok) {
                const project = await response.json()
                setProjectName(project.name)
            }
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

export default App