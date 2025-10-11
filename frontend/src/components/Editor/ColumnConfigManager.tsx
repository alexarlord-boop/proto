import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import type { ColumnConfig } from './types'

interface ColumnConfigManagerProps {
  columns: ColumnConfig[]
  availableColumns: string[]  // All possible column names from data
  onChange: (columns: ColumnConfig[]) => void
}

export function ColumnConfigManager({ columns, availableColumns, onChange }: ColumnConfigManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localColumns, setLocalColumns] = useState<ColumnConfig[]>([])

  // Initialize local state when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Create column configs for all available columns
      const configs: ColumnConfig[] = availableColumns.map((colKey) => {
        const existing = columns.find((c) => c.key === colKey)
        return existing || {
          key: colKey,
          label: colKey.charAt(0).toUpperCase() + colKey.slice(1).replace(/_/g, ' '),
          visible: true,
        }
      })
      setLocalColumns(configs)
    }
  }, [isOpen, availableColumns, columns])

  const handleSave = () => {
    onChange(localColumns)
    setIsOpen(false)
  }

  const handleToggleVisibility = (index: number) => {
    const updated = [...localColumns]
    updated[index] = { ...updated[index], visible: !updated[index].visible }
    setLocalColumns(updated)
  }

  const handleLabelChange = (index: number, label: string) => {
    const updated = [...localColumns]
    updated[index] = { ...updated[index], label }
    setLocalColumns(updated)
  }

  const handleWidthChange = (index: number, width: string) => {
    const updated = [...localColumns]
    updated[index] = { ...updated[index], width }
    setLocalColumns(updated)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...localColumns]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    setLocalColumns(updated)
  }

  const handleMoveDown = (index: number) => {
    if (index === localColumns.length - 1) return
    const updated = [...localColumns]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    setLocalColumns(updated)
  }

  const visibleCount = localColumns.filter((c) => c.visible).length
  const hiddenCount = localColumns.length - visibleCount

  return (
    <div className="space-y-2">
      <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full">
        Configure Columns ({visibleCount} visible, {hiddenCount} hidden)
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Column Configuration</DialogTitle>
            <DialogDescription>
              Control column visibility, labels, and order
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            {availableColumns.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <p>No columns available yet.</p>
                <p className="text-sm mt-2">Add data to your table to configure columns.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-600 pb-2 border-b">
                  <div className="col-span-1">Show</div>
                  <div className="col-span-3">Column Key</div>
                  <div className="col-span-4">Display Label</div>
                  <div className="col-span-2">Width</div>
                  <div className="col-span-2">Order</div>
                </div>

                {/* Column Rows */}
                {localColumns.map((col, index) => (
                  <div
                    key={col.key}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded ${
                      col.visible ? 'bg-white border' : 'bg-slate-50 opacity-60 border border-dashed'
                    }`}
                  >
                    {/* Visibility Toggle */}
                    <div className="col-span-1 flex justify-center">
                      <Switch
                        checked={col.visible}
                        onCheckedChange={() => handleToggleVisibility(index)}
                      />
                    </div>

                    {/* Column Key (read-only) */}
                    <div className="col-span-3">
                      <span className="text-sm font-mono text-slate-600">{col.key}</span>
                    </div>

                    {/* Display Label */}
                    <div className="col-span-4">
                      <Input
                        value={col.label}
                        onChange={(e) => handleLabelChange(index, e.target.value)}
                        placeholder="Display label"
                        className="text-sm"
                      />
                    </div>

                    {/* Width */}
                    <div className="col-span-2">
                      <Input
                        value={col.width || ''}
                        onChange={(e) => handleWidthChange(index, e.target.value)}
                        placeholder="auto"
                        className="text-sm"
                      />
                    </div>

                    {/* Reorder Buttons */}
                    <div className="col-span-2 flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="px-2"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === localColumns.length - 1}
                        className="px-2"
                      >
                        ↓
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            {availableColumns.length > 0 && (
              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updated = localColumns.map((col) => ({ ...col, visible: true }))
                    setLocalColumns(updated)
                  }}
                >
                  Show All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updated = localColumns.map((col) => ({ ...col, visible: false }))
                    setLocalColumns(updated)
                  }}
                >
                  Hide All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updated = localColumns.map((col) => ({
                      ...col,
                      label: col.key.charAt(0).toUpperCase() + col.key.slice(1).replace(/_/g, ' '),
                      width: undefined,
                    }))
                    setLocalColumns(updated)
                  }}
                >
                  Reset Labels
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

