import { DnDEditor } from "@/components/Editor/DnDEditor.tsx"
import { QueryCreator } from "@/components/QueryCreator/QueryCreator.tsx"
import { useState, useEffect } from "react"

function App() {
    // Simple routing based on pathname
    const [currentPath, setCurrentPath] = useState(window.location.pathname)

    useEffect(() => {
        // Listen for popstate events (browser back/forward)
        const handlePopState = () => {
            setCurrentPath(window.location.pathname)
        }
        
        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    // Simple navigation function
    const navigate = (path: string) => {
        window.history.pushState({}, '', path)
        setCurrentPath(path)
    }

    // Add navigation button to editor
    if (currentPath === '/query-creator') {
        return <QueryCreator />
    }

    return (
        <div className="h-screen flex flex-col">
            <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between">
                <h1 className="text-lg font-semibold">Proto Editor</h1>
                <button
                    onClick={() => navigate('/query-creator')}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                    Query Creator
                </button>
            </div>
            <div className="flex-1 overflow-hidden">
                <DnDEditor />
            </div>
        </div>
    )
}

export default App