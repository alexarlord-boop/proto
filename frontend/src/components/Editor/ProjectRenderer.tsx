import { renderComponent } from './component-registry'
import type { ComponentInstance } from './types'

interface ProjectRendererProps {
  components: ComponentInstance[]
  projectName?: string
  mode?: 'production' | 'development'
}

/**
 * ProjectRenderer - Pure runtime renderer without editor UI
 * Used for exported projects and production deployments
 * No drag & drop, no selection, no editing - just renders components
 */
export function ProjectRenderer({ 
  components, 
  projectName = 'App',
  mode = 'production' 
}: ProjectRendererProps) {
  
  // In production mode, components are rendered without any editor chrome
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white to-slate-50">
      {/* Optional app header */}
      {mode === 'development' && (
        <div className="bg-slate-800 text-white px-6 py-3 border-b border-slate-700">
          <h1 className="text-lg font-semibold">{projectName}</h1>
        </div>
      )}

      {/* Canvas area - absolute positioning for components */}
      <div className="relative w-full min-h-screen">
        {components.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-lg">
            {mode === 'production' ? 'No components' : 'Canvas is empty'}
          </div>
        ) : (
          components.map((component) => (
            <ComponentRenderer 
              key={component.id} 
              component={component}
              mode={mode}
            />
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Recursive component renderer - handles nested children in containers
 */
function ComponentRenderer({ 
  component, 
  mode 
}: { 
  component: ComponentInstance
  mode: 'production' | 'development'
}) {
  const style = {
    left: `${component.position.x}px`,
    top: `${component.position.y}px`,
    width: component.width ? `${component.width}px` : undefined,
    height: component.height ? `${component.height}px` : undefined,
  }

  // Skip rendering if parentId exists (will be rendered by parent container)
  if (component.parentId) {
    return null
  }

  return (
    <div
      className="absolute"
      style={style}
      data-component-id={component.id}
      data-component-type={component.type}
    >
      {renderComponent(component)}
    </div>
  )
}

/**
 * Standalone renderer for use in exported HTML files
 * This version includes all dependencies inline
 */
export function createStandaloneRenderer(
  components: ComponentInstance[],
  projectName: string
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  
  <!-- Tailwind CSS (via CDN) -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- React & ReactDOM (via CDN) -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  
  <style>
    /* Custom styles */
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    * {
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel" data-type="module">
    const { useState, useEffect } = React;
    
    // Component data (injected during export)
    const COMPONENTS = ${JSON.stringify(components, null, 2)};
    const PROJECT_NAME = ${JSON.stringify(projectName)};
    
    // Component renderers
    function Button({ text, variant, size, disabled, onClick }) {
      const variantClasses = {
        default: 'bg-slate-900 text-white hover:bg-slate-800',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-slate-300 bg-white hover:bg-slate-50',
        secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
        ghost: 'hover:bg-slate-100',
        link: 'text-blue-600 underline hover:text-blue-700',
      };
      
      const sizeClasses = {
        default: 'px-4 py-2 text-sm',
        sm: 'px-3 py-1.5 text-xs',
        lg: 'px-6 py-3 text-base',
        icon: 'p-2',
      };
      
      return (
        <button
          onClick={onClick}
          disabled={disabled}
          className={\`rounded-md font-medium transition-colors \${variantClasses[variant || 'default']} \${sizeClasses[size || 'default']} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
        >
          {text}
        </button>
      );
    }
    
    function Input({ placeholder, type, defaultValue, disabled }) {
      const [value, setValue] = useState(defaultValue || '');
      
      return (
        <input
          type={type || 'text'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }
    
    function Select({ placeholder, options, defaultValue, disabled }) {
      const [value, setValue] = useState(defaultValue || '');
      
      return (
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">{placeholder}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }
    
    function DataTable({ columns, data, dataSource, dataSourceType, queryId, striped, bordered }) {
      const [tableData, setTableData] = useState(data || []);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      
      useEffect(() => {
        if (dataSourceType === 'query' && queryId) {
          fetchQueryData(queryId);
        } else if (dataSourceType === 'url' && dataSource) {
          fetchUrlData(dataSource);
        }
      }, [dataSourceType, queryId, dataSource]);
      
      const fetchQueryData = async (id) => {
        setLoading(true);
        try {
          const response = await fetch(\`http://localhost:8000/api/queries/\${id}/execute\`);
          const result = await response.json();
          setTableData(result.data || []);
        } catch (err) {
          setError('Failed to load data');
        } finally {
          setLoading(false);
        }
      };
      
      const fetchUrlData = async (url) => {
        setLoading(true);
        try {
          const response = await fetch(url);
          const result = await response.json();
          setTableData(result.data || result);
        } catch (err) {
          setError('Failed to load data');
        } finally {
          setLoading(false);
        }
      };
      
      if (loading) {
        return <div className="p-4 text-slate-600">Loading...</div>;
      }
      
      if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
      }
      
      if (!tableData || tableData.length === 0) {
        return <div className="p-4 text-slate-400">No data available</div>;
      }
      
      const derivedColumns = columns || Object.keys(tableData[0] || {}).map(key => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1)
      }));
      
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className={\`w-full text-sm \${bordered ? 'border-collapse' : ''}\`}>
            <thead className="bg-slate-100">
              <tr>
                {derivedColumns.map((col) => (
                  <th key={col.key} className={\`px-4 py-2 text-left font-medium text-slate-700 \${bordered ? 'border border-slate-200' : ''}\`}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx} className={\`\${striped && idx % 2 === 1 ? 'bg-slate-50' : ''}\`}>
                  {derivedColumns.map((col) => (
                    <td key={col.key} className={\`px-4 py-2 text-slate-600 \${bordered ? 'border border-slate-200' : ''}\`}>
                      {row[col.key] !== null && row[col.key] !== undefined ? String(row[col.key]) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    function TabsComponent({ tabs, defaultValue }) {
      const [activeTab, setActiveTab] = useState(defaultValue || tabs?.[0]?.value || '');
      
      return (
        <div className="w-full">
          <div className="border-b border-slate-200">
            <div className="flex gap-1">
              {tabs?.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={\`px-4 py-2 text-sm font-medium transition-colors \${
                    activeTab === tab.value
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }\`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            {tabs?.find(t => t.value === activeTab)?.content || ''}
          </div>
        </div>
      );
    }
    
    function Container({ padding, backgroundColor, children }) {
      const style = {
        padding: padding || '16px',
        backgroundColor: backgroundColor || 'transparent',
      };
      
      return (
        <div style={style} className="rounded-lg">
          {children}
        </div>
      );
    }
    
    function Grid({ columns, gap, children }) {
      const style = {
        display: 'grid',
        gridTemplateColumns: \`repeat(\${columns || 2}, 1fr)\`,
        gap: gap || '16px',
      };
      
      return <div style={style}>{children}</div>;
    }
    
    function Stack({ direction, gap, align, children }) {
      const style = {
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        gap: gap || '8px',
        alignItems: align || 'stretch',
      };
      
      return <div style={style}>{children}</div>;
    }
    
    // Component renderer
    function renderComponent(component) {
      const executeEventHandler = (code) => {
        try {
          const fn = new Function('component', 'event', code);
          return (e) => fn(component, e);
        } catch (err) {
          console.error('Error executing event handler:', err);
          return () => {};
        }
      };
      
      const commonProps = {};
      if (component.eventHandlers?.onClick) {
        commonProps.onClick = executeEventHandler(component.eventHandlers.onClick.code);
      }
      
      switch (component.type) {
        case 'Button':
          return <Button {...component.props} {...commonProps} />;
        case 'Input':
          return <Input {...component.props} />;
        case 'Select':
          return <Select {...component.props} />;
        case 'Table':
          return <DataTable {...component.props} />;
        case 'Tabs':
          return <TabsComponent {...component.props} />;
        case 'Container':
          return (
            <Container {...component.props}>
              {component.children?.map(child => (
                <div key={child.id} style={{ position: 'relative' }}>
                  {renderComponent(child)}
                </div>
              ))}
            </Container>
          );
        case 'Grid':
          return (
            <Grid {...component.props}>
              {component.children?.map(child => renderComponent(child))}
            </Grid>
          );
        case 'Stack':
          return (
            <Stack {...component.props}>
              {component.children?.map(child => renderComponent(child))}
            </Stack>
          );
        default:
          return <div>Unknown component: {component.type}</div>;
      }
    }
    
    // Main App component
    function App() {
      return (
        <div className="w-full min-h-screen bg-gradient-to-br from-white to-slate-50">
          <div className="relative w-full min-h-screen">
            {COMPONENTS.map((component) => {
              if (component.parentId) return null;
              
              const style = {
                position: 'absolute',
                left: \`\${component.position.x}px\`,
                top: \`\${component.position.y}px\`,
                width: component.width ? \`\${component.width}px\` : undefined,
                height: component.height ? \`\${component.height}px\` : undefined,
              };
              
              return (
                <div key={component.id} style={style}>
                  {renderComponent(component)}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    // Render the app
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
  
  <!-- Babel standalone for JSX transformation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</body>
</html>
  `.trim();
}

