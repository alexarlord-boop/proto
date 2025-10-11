import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FullScreenPreviewProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function FullScreenPreview({ isOpen, onClose, children, title }: FullScreenPreviewProps) {
  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-slate-800/90 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <Maximize2 className="w-5 h-5 text-blue-400" />
          <h2 className="text-white font-semibold text-lg">
            {title || 'Full Screen Preview'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm mr-4">Press ESC to exit</span>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="absolute top-14 left-0 right-0 bottom-0 overflow-auto">
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

