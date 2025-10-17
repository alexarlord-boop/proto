import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Database, FileText, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const API_BASE = 'http://localhost:8000'

interface DBConnector {
  id: string
  name: string
  db_type: string
  database: string
  is_active: boolean
}

interface SQLQuery {
  id: string
  name: string
  description: string | null
  connector_id: string
  is_valid: boolean
}

interface QueryTreeSelectProps {
  value?: string
  onChange: (queryId: string) => void
  disabled?: boolean
  placeholder?: string
}

export function QueryTreeSelect({
  value,
  onChange,
  disabled = false,
  placeholder = 'Select a query...',
}: QueryTreeSelectProps) {
  const [connectors, setConnectors] = useState<DBConnector[]>([])
  const [queries, setQueries] = useState<SQLQuery[]>([])
  const [expandedConnectors, setExpandedConnectors] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-expand connector if a query is selected
  useEffect(() => {
    if (value && queries.length > 0) {
      const selectedQuery = queries.find(q => q.id === value)
      if (selectedQuery) {
        setExpandedConnectors(prev => new Set(prev).add(selectedQuery.connector_id))
      }
    }
  }, [value, queries])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [connectorsRes, queriesRes] = await Promise.all([
        fetch(`${API_BASE}/api/connectors`),
        fetch(`${API_BASE}/api/queries`),
      ])
      
      const connectorsData = await connectorsRes.json()
      const queriesData = await queriesRes.json()
      
      setConnectors(connectorsData)
      setQueries(queriesData.filter((q: SQLQuery) => q.is_valid))
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleConnector = (connectorId: string) => {
    setExpandedConnectors(prev => {
      const next = new Set(prev)
      if (next.has(connectorId)) {
        next.delete(connectorId)
      } else {
        next.add(connectorId)
      }
      return next
    })
  }

  const getQueriesForConnector = (connectorId: string) => {
    return queries.filter(q => q.connector_id === connectorId)
  }

  const getSelectedQueryName = () => {
    if (!value) return null
    const query = queries.find(q => q.id === value)
    if (!query) return null
    const connector = connectors.find(c => c.id === query.connector_id)
    return `${connector?.name || 'Unknown'} / ${query.name}`
  }

  // Filter connectors and queries based on search
  const filteredConnectors = connectors.filter(connector => {
    if (!searchTerm) return true
    
    const matchesConnector = connector.name.toLowerCase().includes(searchTerm.toLowerCase())
    const hasMatchingQuery = queries.some(
      q => q.connector_id === connector.id && 
           (q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    
    return matchesConnector || hasMatchingQuery
  })

  const filterQueries = (connectorQueries: SQLQuery[]) => {
    if (!searchTerm) return connectorQueries
    
    return connectorQueries.filter(
      q => q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Auto-expand filtered connectors
  useEffect(() => {
    if (searchTerm) {
      const expandAll = new Set(filteredConnectors.map(c => c.id))
      setExpandedConnectors(expandAll)
    }
  }, [searchTerm])

  if (loading) {
    return (
      <div className="w-full p-4 border rounded-md bg-slate-50 text-center text-sm text-slate-500">
        Loading queries...
      </div>
    )
  }

  const selectedQueryName = getSelectedQueryName()

  return (
    <div className="w-full space-y-2">
      {/* Selected Query Display */}
      {selectedQueryName && (
        <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="font-medium">{selectedQueryName}</span>
          </div>
          <button
            onClick={() => onChange('')}
            className="text-blue-600 hover:text-blue-800 text-xs underline"
            disabled={disabled}
          >
            Clear
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search connectors or queries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          disabled={disabled}
        />
      </div>

      {/* Tree View */}
      <div className="border rounded-md overflow-hidden bg-white max-h-96 overflow-y-auto">
        {filteredConnectors.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-500">
            No connectors or queries found
          </div>
        ) : (
          <div className="divide-y">
            {filteredConnectors.map((connector) => {
              const connectorQueries = getQueriesForConnector(connector.id)
              const filteredConnectorQueries = filterQueries(connectorQueries)
              const isExpanded = expandedConnectors.has(connector.id)
              const hasQueries = filteredConnectorQueries.length > 0

              return (
                <Collapsible
                  key={connector.id}
                  open={isExpanded}
                  onOpenChange={() => toggleConnector(connector.id)}
                >
                  <CollapsibleTrigger
                    className={cn(
                      "w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition-colors",
                      !connector.is_active && "opacity-50",
                      disabled && "pointer-events-none"
                    )}
                  >
                    {hasQueries ? (
                      isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      )
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                    <Database className="w-4 h-4 text-blue-600" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-slate-900">
                        {connector.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {connector.db_type} • {connector.database}
                        {!connector.is_active && ' (inactive)'}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {connectorQueries.length} {connectorQueries.length === 1 ? 'query' : 'queries'}
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    {filteredConnectorQueries.length === 0 ? (
                      <div className="px-10 py-2 text-xs text-slate-400">
                        No queries found
                      </div>
                    ) : (
                      <div className="bg-slate-50">
                        {filteredConnectorQueries.map((query) => (
                          <button
                            key={query.id}
                            onClick={() => onChange(query.id)}
                            disabled={disabled}
                            className={cn(
                              "w-full px-10 py-2 text-left hover:bg-slate-100 transition-colors flex items-center gap-2 group",
                              value === query.id && "bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500",
                              disabled && "pointer-events-none opacity-50"
                            )}
                          >
                            <FileText className={cn(
                              "w-3.5 h-3.5",
                              value === query.id ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                            )} />
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "text-sm font-medium truncate",
                                value === query.id ? "text-blue-900" : "text-slate-700"
                              )}>
                                {query.name}
                              </div>
                              {query.description && (
                                <div className="text-xs text-slate-500 truncate">
                                  {query.description}
                                </div>
                              )}
                            </div>
                            {value === query.id && (
                              <div className="text-xs text-blue-600 font-medium">
                                ✓
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        )}
      </div>

      {/* Helper Links */}
      <div className="flex items-center justify-between text-xs">
        <button
          onClick={() => window.open('/query-creator', '_blank')}
          className="text-blue-600 hover:text-blue-700 underline"
          disabled={disabled}
        >
          Open Query Creator
        </button>
        <button
          onClick={fetchData}
          className="text-slate-500 hover:text-slate-700 underline"
          disabled={disabled}
        >
          Refresh
        </button>
      </div>
    </div>
  )
}

