import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { SchemaVisualizer } from './SchemaVisualizer'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

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
  sql_query: string
  connector_id: string
  is_valid: boolean
  validation_error: string | null
  last_executed: string | null
  created_at: string
}

interface ForeignKey {
  constrained_columns: string[]
  referred_table: string
  referred_columns: string[]
}

interface SchemaTable {
  name: string
  columns: Array<{
    name: string
    type: string
    nullable: boolean
    primary_key: boolean
  }>
  primary_keys?: string[]
  foreign_keys?: ForeignKey[]
}

interface DefaultQuery {
  table_name: string
  query_name: string
  description: string
  sql_query: string
  query_type: string
}

interface ConnectorDefaultQueries {
  connector_id: string
  queries: DefaultQuery[]
}

export function QueryCreator() {
  const { t } = useTranslation()
  const [connectors, setConnectors] = useState<DBConnector[]>([])
  const [queries, setQueries] = useState<SQLQuery[]>([])
  const [selectedConnector, setSelectedConnector] = useState<string>('')
  const [schema, setSchema] = useState<SchemaTable[]>([])
  const [defaultQueries, setDefaultQueries] = useState<Record<string, DefaultQuery[]>>({})
  const [expandedConnectors, setExpandedConnectors] = useState<Set<string>>(new Set())
  
  // Query form state
  const [queryName, setQueryName] = useState('')
  const [queryDescription, setQueryDescription] = useState('')
  const [sqlQuery, setSqlQuery] = useState('')
  const [validationResult, setValidationResult] = useState<any>(null)
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [editingQueryId, setEditingQueryId] = useState<string | null>(null)
  
  // Connector form state
  const [showConnectorForm, setShowConnectorForm] = useState(false)
  const [connectorName, setConnectorName] = useState('')
  const [connectorType, setConnectorType] = useState('sqlite')
  const [connectorDatabase, setConnectorDatabase] = useState('')
  const [connectorHost, setConnectorHost] = useState('')
  const [connectorPort, setConnectorPort] = useState('')
  const [connectorUsername, setConnectorUsername] = useState('')
  const [connectorPassword, setConnectorPassword] = useState('')

  // Load connectors on mount
  useEffect(() => {
    fetchConnectors()
    fetchQueries()
  }, [])

  // Load default queries when connectors are loaded
  useEffect(() => {
    const loadDefaultQueries = async () => {
      for (const connector of connectors) {
        await fetchDefaultQueries(connector.id)
      }
    }
    
    if (connectors.length > 0) {
      loadDefaultQueries()
    }
  }, [connectors.length])

  // Load schema when connector is selected
  useEffect(() => {
    if (selectedConnector) {
      fetchSchema(selectedConnector)
    }
  }, [selectedConnector])

  const fetchConnectors = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/connectors`)
      const data = await response.json()
      setConnectors(data)
    } catch (error) {
      console.error('Error fetching connectors:', error)
    }
  }

  const fetchQueries = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/queries`)
      const data = await response.json()
      setQueries(data)
    } catch (error) {
      console.error('Error fetching queries:', error)
    }
  }

  const fetchSchema = async (connectorId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/connectors/${connectorId}/schema`)
      const data = await response.json()
      setSchema(data.tables || [])
    } catch (error) {
      console.error('Error fetching schema:', error)
      setSchema([])
    }
  }

  const fetchDefaultQueries = async (connectorId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/connectors/${connectorId}/default-queries`)
      const data = await response.json()
      if (data.success && data.queries) {
        setDefaultQueries(prev => ({
          ...prev,
          [connectorId]: data.queries
        }))
      }
    } catch (error) {
      console.error('Error fetching default queries:', error)
    }
  }

  const createConnector = async () => {
    try {
      const payload: any = {
        name: connectorName,
        db_type: connectorType,
        database: connectorDatabase,
      }

      if (connectorType !== 'sqlite') {
        payload.host = connectorHost
        payload.port = parseInt(connectorPort)
        payload.username = connectorUsername
        payload.password = connectorPassword
      }

      const response = await fetch(`${API_BASE}/api/connectors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error: ${error.detail}`)
        return
      }

      // Reset form and refresh
      setConnectorName('')
      setConnectorType('sqlite')
      setConnectorDatabase('')
      setConnectorHost('')
      setConnectorPort('')
      setConnectorUsername('')
      setConnectorPassword('')
      setShowConnectorForm(false)
      fetchConnectors()
      alert(t('queryCreator.connectorCreated'))
    } catch (error) {
      console.error('Error creating connector:', error)
      alert(t('queryCreator.connectorCreateFailed'))
    }
  }

  const validateQuery = async () => {
    if (!sqlQuery || !selectedConnector) {
      alert(t('queryCreator.selectConnectorPrompt'))
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/queries/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql_query: sqlQuery,
          connector_id: selectedConnector,
        }),
      })

      const data = await response.json()
      setValidationResult(data)
    } catch (error) {
      console.error('Error validating query:', error)
      setValidationResult({ valid: false, message: t('queryCreator.validationFailed') })
    }
  }

  const saveQuery = async () => {
    if (!queryName || !sqlQuery || !selectedConnector) {
      alert(t('queryCreator.fillRequiredFields'))
      return
    }

    try {
      const url = editingQueryId 
        ? `${API_BASE}/api/queries/${editingQueryId}`
        : `${API_BASE}/api/queries`
      
      const method = editingQueryId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: queryName,
          description: queryDescription,
          sql_query: sqlQuery,
          connector_id: selectedConnector,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error: ${error.detail}`)
        return
      }

      // Reset form and refresh
      setQueryName('')
      setQueryDescription('')
      setSqlQuery('')
      setValidationResult(null)
      setExecutionResult(null)
      setEditingQueryId(null)
      fetchQueries()
      alert(editingQueryId ? t('queryCreator.queryUpdated') : t('queryCreator.querySaved'))
    } catch (error) {
      console.error('Error saving query:', error)
      alert(t('queryCreator.querySaveFailed'))
    }
  }

  const executeQuery = async () => {
    if (!sqlQuery || !selectedConnector) {
      alert(t('queryCreator.selectConnectorPrompt'))
      return
    }

    try {
      // If editing existing query, use its ID
      if (editingQueryId) {
        const response = await fetch(`${API_BASE}/api/queries/${editingQueryId}/execute`)
        const data = await response.json()
        setExecutionResult(data)
      } else {
        // For new query, validate first
        await validateQuery()
        alert(t('queryCreator.saveQueryFirst'))
      }
    } catch (error) {
      console.error('Error executing query:', error)
      setExecutionResult({ success: false, message: t('queryCreator.executionFailed') })
    }
  }

  const loadQuery = (query: SQLQuery) => {
    setEditingQueryId(query.id)
    setQueryName(query.name)
    setQueryDescription(query.description || '')
    setSqlQuery(query.sql_query)
    setSelectedConnector(query.connector_id)
    setValidationResult(null)
    setExecutionResult(null)
  }

  const deleteQuery = async (queryId: string) => {
    if (!confirm(t('queryCreator.deleteQueryConfirm'))) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/queries/${queryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete query')
      }

      fetchQueries()
      if (editingQueryId === queryId) {
        setEditingQueryId(null)
        setQueryName('')
        setQueryDescription('')
        setSqlQuery('')
      }
    } catch (error) {
      console.error('Error deleting query:', error)
      alert('Failed to delete query')
    }
  }

  const newQuery = () => {
    setEditingQueryId(null)
    setQueryName('')
    setQueryDescription('')
    setSqlQuery('')
    setValidationResult(null)
    setExecutionResult(null)
  }

  const loadDefaultQuery = (defaultQuery: DefaultQuery, connectorId: string) => {
    setEditingQueryId(null)
    setQueryName(defaultQuery.query_name)
    setQueryDescription(defaultQuery.description)
    setSqlQuery(defaultQuery.sql_query)
    setSelectedConnector(connectorId)
    setValidationResult(null)
    setExecutionResult(null)
  }

  const toggleConnectorExpansion = (connectorId: string) => {
    setExpandedConnectors(prev => {
      const newSet = new Set(prev)
      if (newSet.has(connectorId)) {
        newSet.delete(connectorId)
      } else {
        newSet.add(connectorId)
      }
      return newSet
    })
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('queryCreator.title')}</h1>
          <p className="text-sm text-slate-600">{t('queryCreator.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={() => {
              window.history.pushState({}, '', '/')
              window.location.reload()
            }}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded transition-colors"
          >
            {t('queryCreator.backToEditor')}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Connectors & Queries */}
        <div className="w-80 bg-white border-r flex flex-col">
          <Tabs defaultValue="queries" className="flex-1 flex flex-col">
            <TabsList className="m-4 grid grid-cols-2">
              <TabsTrigger value="queries">{t('queryCreator.queries')}</TabsTrigger>
              <TabsTrigger value="connectors">{t('queryCreator.connectors')}</TabsTrigger>
            </TabsList>

            <TabsContent value="queries" className="flex-1 overflow-auto px-4 pb-4">
              <Button onClick={newQuery} className="w-full mb-4" variant="outline">
                + {t('queryCreator.newQuery')}
              </Button>
              
              <div className="space-y-2">
                {queries.map((query) => (
                  <div
                    key={query.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-slate-50 ${
                      editingQueryId === query.id ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div onClick={() => loadQuery(query)} className="flex-1">
                        <div className="font-medium text-sm">{query.name}</div>
                        {query.description && (
                          <div className="text-xs text-slate-500 mt-1">{query.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            query.is_valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {query.is_valid ? t('queryCreator.valid') : t('queryCreator.invalid')}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteQuery(query.id)
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="connectors" className="flex-1 overflow-auto px-4 pb-4">
              <Button 
                onClick={() => setShowConnectorForm(!showConnectorForm)} 
                className="w-full mb-4" 
                variant="outline"
              >
                {showConnectorForm ? t('common.cancel') : '+ ' + t('queryCreator.newConnector')}
              </Button>

              {showConnectorForm && (
                <div className="mb-4 p-4 border rounded-lg bg-slate-50 space-y-3">
                  <Input
                    placeholder={t('queryCreator.connectorName')}
                    value={connectorName}
                    onChange={(e) => setConnectorName(e.target.value)}
                  />
                  
                  <Select value={connectorType} onValueChange={setConnectorType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder={connectorType === 'sqlite' ? t('queryCreator.databasePath') : t('queryCreator.databaseName')}
                    value={connectorDatabase}
                    onChange={(e) => setConnectorDatabase(e.target.value)}
                  />

                  {connectorType !== 'sqlite' && (
                    <>
                      <Input
                        placeholder={t('queryCreator.host')}
                        value={connectorHost}
                        onChange={(e) => setConnectorHost(e.target.value)}
                      />
                      <Input
                        placeholder={t('queryCreator.port')}
                        value={connectorPort}
                        onChange={(e) => setConnectorPort(e.target.value)}
                      />
                      <Input
                        placeholder={t('queryCreator.username')}
                        value={connectorUsername}
                        onChange={(e) => setConnectorUsername(e.target.value)}
                      />
                      <Input
                        type="password"
                        placeholder={t('queryCreator.password')}
                        value={connectorPassword}
                        onChange={(e) => setConnectorPassword(e.target.value)}
                      />
                    </>
                  )}

                  <Button onClick={createConnector} className="w-full">
                    {t('queryCreator.createConnector')}
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                {connectors.map((connector) => {
                  const connectorQueries = defaultQueries[connector.id] || []
                  const isExpanded = expandedConnectors.has(connector.id)
                  
                  return (
                    <Collapsible
                      key={connector.id}
                      open={isExpanded}
                      onOpenChange={() => toggleConnectorExpansion(connector.id)}
                    >
                      <div className={`border rounded-lg ${
                        selectedConnector === connector.id ? 'bg-blue-50 border-blue-300' : 'bg-white'
                      }`}>
                        {/* Connector Header */}
                        <div className="p-3 flex items-start justify-between">
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => setSelectedConnector(connector.id)}
                          >
                            <div className="font-medium text-sm">{connector.name}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {connector.db_type} - {connector.database}
                            </div>
                          </div>
                          
                          {connectorQueries.length > 0 && (
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          )}
                        </div>

                        {/* Default Queries List */}
                        {connectorQueries.length > 0 && (
                          <CollapsibleContent>
                            <div className="border-t px-3 pb-2">
                              <div className="text-xs font-semibold text-slate-600 mt-2 mb-1 px-2">
                                {t('queryCreator.defaultQueries')} ({connectorQueries.length})
                              </div>
                              <div className="space-y-1">
                                {connectorQueries.map((query, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2 rounded hover:bg-slate-100 cursor-pointer transition-colors text-xs"
                                    onClick={() => loadDefaultQuery(query, connector.id)}
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className="text-blue-600 mt-0.5">📄</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-700 truncate">
                                          {query.table_name}
                                        </div>
                                        <div className="text-slate-500 text-[10px] truncate">
                                          SELECT * FROM {query.table_name}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CollapsibleContent>
                        )}
                      </div>
                    </Collapsible>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content - Query Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Query Form */}
              <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {editingQueryId ? t('queryCreator.editQuery') : t('queryCreator.newQuery')}
                  </h2>
                  {editingQueryId && (
                    <Button onClick={newQuery} variant="outline" size="sm">
                      {t('queryCreator.newQuery')}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder={t('queryCreator.queryName')}
                    value={queryName}
                    onChange={(e) => setQueryName(e.target.value)}
                  />
                  
                  <Select value={selectedConnector} onValueChange={setSelectedConnector}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('queryCreator.selectConnector')} />
                    </SelectTrigger>
                    <SelectContent>
                      {connectors.map((connector) => (
                        <SelectItem key={connector.id} value={connector.id}>
                          {connector.name} ({connector.db_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  placeholder={t('queryCreator.descriptionOptional')}
                  value={queryDescription}
                  onChange={(e) => setQueryDescription(e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('queryCreator.sqlQuery')}
                  </label>
                  <textarea
                    className="w-full min-h-[200px] p-3 border rounded-lg font-mono text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('queryCreator.sqlQueryPlaceholder')}
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={validateQuery} variant="outline">
                    {t('queryCreator.validate')}
                  </Button>
                  <Button onClick={executeQuery} variant="outline">
                    {t('queryCreator.execute')}
                  </Button>
                  <Button onClick={saveQuery}>
                    {editingQueryId ? t('queryCreator.updateQuery') : t('queryCreator.saveQuery')}
                  </Button>
                </div>

                {/* Validation Result */}
                {validationResult && (
                  <div className={`p-4 rounded-lg ${
                    validationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className={`font-medium ${
                      validationResult.valid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {validationResult.valid ? t('queryCreator.queryValid') : t('queryCreator.queryInvalid')}
                    </div>
                    <div className={`text-sm mt-1 ${
                      validationResult.valid ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {validationResult.message}
                    </div>
                    {validationResult.query_type && (
                      <div className="text-sm mt-1 text-slate-600">
                        {t('queryCreator.queryType')}: {validationResult.query_type}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Schema Browser */}
              {selectedConnector && schema.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">{t('queryCreator.databaseSchema')}</h3>
                  
                  <Tabs defaultValue="diagram" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="diagram">{t('queryCreator.visualDiagram')}</TabsTrigger>
                      <TabsTrigger value="details">{t('queryCreator.tableDetails')}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="diagram" className="mt-0">
                      <div className="h-[600px] border rounded-lg overflow-hidden">
                        <SchemaVisualizer schema={schema} />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="details" className="mt-0">
                      <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {schema.map((table) => (
                          <details key={table.name} className="border rounded-lg">
                            <summary className="cursor-pointer p-3 hover:bg-slate-50 font-medium">
                              📊 {table.name}
                              {table.foreign_keys && table.foreign_keys.length > 0 && (
                                <span className="ml-2 text-xs text-blue-600">
                                  ({table.foreign_keys.length} {t('queryCreator.relationships')})
                                </span>
                              )}
                            </summary>
                            <div className="p-3 border-t bg-slate-50">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>{t('queryCreator.column')}</TableHead>
                                    <TableHead>{t('queryCreator.type')}</TableHead>
                                    <TableHead>{t('queryCreator.nullable')}</TableHead>
                                    <TableHead>{t('queryCreator.primaryKey')}</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {table.columns.map((column) => (
                                    <TableRow key={column.name}>
                                      <TableCell className="font-mono text-sm">{column.name}</TableCell>
                                      <TableCell className="text-sm text-slate-600">{column.type}</TableCell>
                                      <TableCell className="text-sm">{column.nullable ? t('common.yes') : t('common.no')}</TableCell>
                                      <TableCell className="text-sm">{column.primary_key ? '🔑' : ''}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              
                              {/* Foreign Key Relationships */}
                              {table.foreign_keys && table.foreign_keys.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                  <div className="text-sm font-semibold text-slate-700 mb-2">{t('queryCreator.foreignKeyRelationships')}</div>
                                  <div className="space-y-2">
                                    {table.foreign_keys.map((fk, idx) => (
                                      <div key={idx} className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
                                        <span className="font-mono text-blue-700">{fk.constrained_columns.join(', ')}</span>
                                        <span className="text-slate-600 mx-2">→</span>
                                        <span className="font-semibold text-blue-900">{fk.referred_table}</span>
                                        <span className="text-slate-600">.</span>
                                        <span className="font-mono text-blue-700">{fk.referred_columns.join(', ')}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </details>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Execution Results */}
              {executionResult && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">{t('queryCreator.queryResults')}</h3>
                  
                  {executionResult.columns && executionResult.data && (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {executionResult.columns.map((col: any) => (
                              <TableHead key={col.key}>{col.label}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {executionResult.data.map((row: any, idx: number) => (
                            <TableRow key={idx}>
                              {executionResult.columns.map((col: any) => (
                                <TableCell key={col.key}>{row[col.key]}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="p-3 bg-slate-50 border-t text-sm text-slate-600">
                        {executionResult.data.length} {t('queryCreator.rowsReturned')}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

