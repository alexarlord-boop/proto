import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  ComponentInstance,
  ButtonProps,
  InputProps,
  TabsProps,
  SelectProps,
  PaletteComponentDefinition,
} from './types'

// Registry of available components for the palette
export const COMPONENT_REGISTRY: PaletteComponentDefinition[] = [
  {
    type: 'Button',
    label: 'Button',
    icon: '🔘',
    defaultProps: {
      text: 'Click me',
      variant: 'default' as const,
      size: 'default' as const,
    } as ButtonProps,
  },
  {
    type: 'Input',
    label: 'Input',
    icon: '📝',
    defaultProps: {
      placeholder: 'Enter text...',
      type: 'text' as const,
    } as InputProps,
  },
  {
    type: 'Tabs',
    label: 'Tabs',
    icon: '📑',
    defaultProps: {
      tabs: [
        { value: 'tab1', label: 'Tab 1', content: 'Content 1' },
        { value: 'tab2', label: 'Tab 2', content: 'Content 2' },
        { value: 'tab3', label: 'Tab 3', content: 'Content 3' },
      ],
      defaultValue: 'tab1',
    } as TabsProps,
  },
  {
    type: 'Select',
    label: 'Select',
    icon: '📋',
    defaultProps: {
      placeholder: 'Select an option',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
    } as SelectProps,
  },
]

// Render function that takes component instance and renders the actual UI component
export function renderComponent(component: ComponentInstance): React.ReactNode {
  switch (component.type) {
    case 'Button': {
      const props = component.props as ButtonProps
      return (
        <Button variant={props.variant} size={props.size}>
          {props.text}
        </Button>
      )
    }

    case 'Input': {
      const props = component.props as InputProps
      return (
        <Input
          type={props.type}
          placeholder={props.placeholder}
          defaultValue={props.defaultValue}
        />
      )
    }

    case 'Tabs': {
      const props = component.props as TabsProps
      return (
        <Tabs defaultValue={props.defaultValue || props.tabs[0]?.value}>
          <TabsList>
            {props.tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {props.tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      )
    }

    case 'Select': {
      const props = component.props as SelectProps
      return (
        <Select defaultValue={props.defaultValue}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={props.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {props.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    default:
      return <div>Unknown component type</div>
  }
}

// Get preview component for palette (smaller/simplified version)
export function renderPalettePreview(
  componentDef: PaletteComponentDefinition
): React.ReactNode {
  switch (componentDef.type) {
    case 'Button':
      return (
        <Button variant="outline" size="sm" className="pointer-events-none">
          {componentDef.icon} {componentDef.label}
        </Button>
      )

    case 'Input':
      return (
        <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
          <span className="text-2xl">{componentDef.icon}</span>
          <span>{componentDef.label}</span>
        </div>
      )

    case 'Tabs':
      return (
        <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
          <span className="text-2xl">{componentDef.icon}</span>
          <span>{componentDef.label}</span>
        </div>
      )

    case 'Select':
      return (
        <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
          <span className="text-2xl">{componentDef.icon}</span>
          <span>{componentDef.label}</span>
        </div>
      )

    default:
      return (
        <div className="text-sm text-slate-700">
          {componentDef.icon} {componentDef.label}
        </div>
      )
  }
}

