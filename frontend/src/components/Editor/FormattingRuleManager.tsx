import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import type { FormattingRule, FormatCondition, FormatStyle } from './types'

interface FormattingRuleManagerProps {
  rules: FormattingRule[]
  columns: string[]  // Available column names from data
  onChange: (rules: FormattingRule[]) => void
}

export function FormattingRuleManager({ rules, columns, onChange }: FormattingRuleManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<FormattingRule | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAddRule = () => {
    const newRule: FormattingRule = {
      id: `rule-${Date.now()}`,
      name: 'New Rule',
      target: 'row',
      conditions: [{
        column: columns[0] || '',
        operator: 'eq',
        value: '',
      }],
      style: {},
      enabled: true,
    }
    setEditingRule(newRule)
    setEditingIndex(null)
    setIsOpen(true)
  }

  const handleEditRule = (rule: FormattingRule, index: number) => {
    setEditingRule({ ...rule })
    setEditingIndex(index)
    setIsOpen(true)
  }

  const handleSaveRule = () => {
    if (!editingRule) return

    const newRules = [...rules]
    if (editingIndex !== null) {
      newRules[editingIndex] = editingRule
    } else {
      newRules.push(editingRule)
    }
    onChange(newRules)
    setIsOpen(false)
    setEditingRule(null)
    setEditingIndex(null)
  }

  const handleDeleteRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index)
    onChange(newRules)
  }

  const handleToggleRule = (index: number) => {
    const newRules = [...rules]
    newRules[index] = { ...newRules[index], enabled: !newRules[index].enabled }
    onChange(newRules)
  }

  return (
    <div className="space-y-3">
      {/* Rule List */}
      <div className="space-y-2">
        {rules.map((rule, index) => (
          <div
            key={rule.id}
            className={`border rounded-lg p-3 ${rule.enabled ? 'bg-white' : 'bg-slate-50 opacity-60'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => handleToggleRule(index)}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{rule.name}</p>
                  <p className="text-xs text-slate-500">
                    {rule.target === 'row' ? 'Row' : `Cell: ${rule.targetColumn}`} • {rule.conditions.length} condition(s)
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditRule(rule, index)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteRule(index)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Rule Button */}
      <Button onClick={handleAddRule} variant="outline" className="w-full">
        + Add Formatting Rule
      </Button>

      {/* Rule Editor Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit' : 'Create'} Formatting Rule
            </DialogTitle>
            <DialogDescription>
              Define conditions and styling for table rows or cells
            </DialogDescription>
          </DialogHeader>

          {editingRule && (
            <div className="p-6 space-y-6">
              {/* Rule Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Rule Name</label>
                <Input
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  placeholder="e.g., Highlight High Priority"
                />
              </div>

              {/* Target Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Apply To</label>
                  <Select
                    value={editingRule.target}
                    onValueChange={(value: 'row' | 'cell') => {
                      setEditingRule({
                        ...editingRule,
                        target: value,
                        targetColumn: value === 'cell' ? (columns[0] || '') : undefined,
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="row">Entire Row</SelectItem>
                      <SelectItem value="cell">Specific Cell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editingRule.target === 'cell' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Column</label>
                    <Select
                      value={editingRule.targetColumn}
                      onValueChange={(value) => setEditingRule({ ...editingRule, targetColumn: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Conditions */}
              <div>
                <label className="block text-sm font-medium mb-2">Conditions</label>
                <div className="space-y-3">
                  {editingRule.conditions.map((condition, idx) => (
                    <ConditionEditor
                      key={idx}
                      condition={condition}
                      columns={columns}
                      showLogic={idx < editingRule.conditions.length - 1}
                      onChange={(updated) => {
                        const newConditions = [...editingRule.conditions]
                        newConditions[idx] = updated
                        setEditingRule({ ...editingRule, conditions: newConditions })
                      }}
                      onRemove={() => {
                        if (editingRule.conditions.length > 1) {
                          const newConditions = editingRule.conditions.filter((_, i) => i !== idx)
                          setEditingRule({ ...editingRule, conditions: newConditions })
                        }
                      }}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setEditingRule({
                      ...editingRule,
                      conditions: [
                        ...editingRule.conditions,
                        { column: columns[0] || '', operator: 'eq', value: '', logic: 'AND' },
                      ],
                    })
                  }}
                >
                  + Add Condition
                </Button>
              </div>

              {/* Style Settings */}
              <div>
                <label className="block text-sm font-medium mb-2">Styling</label>
                <StyleEditor
                  style={editingRule.style}
                  onChange={(style) => setEditingRule({ ...editingRule, style })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRule}>
              Save Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Condition Editor Component
interface ConditionEditorProps {
  condition: FormatCondition
  columns: string[]
  showLogic: boolean
  onChange: (condition: FormatCondition) => void
  onRemove: () => void
}

function ConditionEditor({ condition, columns, showLogic, onChange, onRemove }: ConditionEditorProps) {
  const operators = [
    { value: 'eq', label: 'Equals (=)' },
    { value: 'neq', label: 'Not Equals (≠)' },
    { value: 'gt', label: 'Greater Than (>)' },
    { value: 'gte', label: 'Greater or Equal (≥)' },
    { value: 'lt', label: 'Less Than (<)' },
    { value: 'lte', label: 'Less or Equal (≤)' },
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Not Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'isEmpty', label: 'Is Empty' },
    { value: 'isNotEmpty', label: 'Is Not Empty' },
  ]

  const needsValue = !['isEmpty', 'isNotEmpty'].includes(condition.operator)

  return (
    <div className="border rounded-lg p-3 bg-slate-50 space-y-3">
      <div className="grid grid-cols-12 gap-2 items-center">
        {/* Column Select */}
        <div className="col-span-4">
          <Select
            value={condition.column}
            onValueChange={(value) => onChange({ ...condition, column: value })}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Column" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Operator Select */}
        <div className="col-span-3">
          <Select
            value={condition.operator}
            onValueChange={(value: any) => onChange({ ...condition, operator: value })}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {operators.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Value Input */}
        {needsValue && (
          <div className="col-span-4">
            <Input
              value={condition.value ?? ''}
              onChange={(e) => onChange({ ...condition, value: e.target.value })}
              placeholder="Value"
              className="text-xs"
            />
          </div>
        )}

        {/* Remove Button */}
        <div className={needsValue ? "col-span-1" : "col-span-5"}>
          <Button
            variant="destructive"
            size="sm"
            onClick={onRemove}
            className="w-full text-xs"
          >
            ×
          </Button>
        </div>
      </div>

      {/* Logic Operator */}
      {showLogic && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">Then</span>
          <Select
            value={condition.logic || 'AND'}
            onValueChange={(value: 'AND' | 'OR') => onChange({ ...condition, logic: value })}
          >
            <SelectTrigger className="w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

// Style Editor Component
interface StyleEditorProps {
  style: FormatStyle
  onChange: (style: FormatStyle) => void
}

function StyleEditor({ style, onChange }: StyleEditorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Background Color */}
      <div>
        <label className="block text-xs font-medium mb-1">Background Color</label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={style.backgroundColor || '#ffffff'}
            onChange={(e) => onChange({ ...style, backgroundColor: e.target.value })}
            className="w-16 h-8 p-1"
          />
          <Input
            type="text"
            value={style.backgroundColor || ''}
            onChange={(e) => onChange({ ...style, backgroundColor: e.target.value })}
            placeholder="#ffffff"
            className="flex-1 text-xs"
          />
        </div>
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-xs font-medium mb-1">Text Color</label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={style.textColor || '#000000'}
            onChange={(e) => onChange({ ...style, textColor: e.target.value })}
            className="w-16 h-8 p-1"
          />
          <Input
            type="text"
            value={style.textColor || ''}
            onChange={(e) => onChange({ ...style, textColor: e.target.value })}
            placeholder="#000000"
            className="flex-1 text-xs"
          />
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-xs font-medium mb-1">Font Weight</label>
        <Select
          value={style.fontWeight || 'normal'}
          onValueChange={(value: any) => onChange({ ...style, fontWeight: value })}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
            <SelectItem value="bolder">Bolder</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Font Style */}
      <div>
        <label className="block text-xs font-medium mb-1">Font Style</label>
        <Select
          value={style.fontStyle || 'normal'}
          onValueChange={(value: any) => onChange({ ...style, fontStyle: value })}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="italic">Italic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Text Decoration */}
      <div className="col-span-2">
        <label className="block text-xs font-medium mb-1">Text Decoration</label>
        <Select
          value={style.textDecoration || 'none'}
          onValueChange={(value: any) => onChange({ ...style, textDecoration: value })}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="underline">Underline</SelectItem>
            <SelectItem value="line-through">Line Through</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

