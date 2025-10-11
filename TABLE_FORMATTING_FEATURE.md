# Table Component: Enhanced Logic-Based Formatting

## Overview

The Table component now supports advanced logic-based formatting capabilities that allow you to:
- **Configure column visibility** - Show/hide specific columns dynamically
- **Apply conditional formatting** - Color rows and cells based on fuzzy logic rules
- **Customize appearance** - Control header colors, row hover effects, and more

## 🎨 Visual Editor Available!

You no longer need to write JSON manually! Use the **visual formatting editors** for an intuitive, point-and-click experience.

- **Column Configuration Manager**: Visual interface for showing/hiding columns, setting widths, and reordering
- **Formatting Rules Manager**: Drag-and-drop rule builder with color pickers and dropdowns

👉 **See [TABLE_FORMATTING_VISUAL_EDITOR.md](TABLE_FORMATTING_VISUAL_EDITOR.md) for the complete visual editor guide!**

The JSON documentation below is still useful for understanding the underlying structure and for advanced use cases.

## Features

### 1. Column Configuration

Control which columns are visible and how they appear:

```json
[
  {
    "key": "id",
    "label": "ID",
    "visible": true,
    "width": "80px"
  },
  {
    "key": "status",
    "label": "Status",
    "visible": true,
    "width": "120px"
  },
  {
    "key": "internal_notes",
    "label": "Notes",
    "visible": false
  }
]
```

**Properties:**
- `key`: Column key from the data
- `label`: Display label (overrides auto-generated label)
- `visible`: Boolean to show/hide column
- `width`: Optional CSS width (e.g., "100px", "15%")

### 2. Formatting Rules

Apply conditional styles to rows or cells based on data values using fuzzy logic.

#### Rule Structure

```json
{
  "id": "rule1",
  "name": "Highlight High Priority",
  "target": "row",
  "conditions": [
    {
      "column": "priority",
      "operator": "eq",
      "value": "high",
      "logic": "OR"
    },
    {
      "column": "urgent",
      "operator": "eq",
      "value": true
    }
  ],
  "style": {
    "backgroundColor": "#fee2e2",
    "textColor": "#991b1b",
    "fontWeight": "bold"
  },
  "enabled": true
}
```

#### Supported Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equals | `value == 100` |
| `neq` | Not equals | `value != 100` |
| `gt` | Greater than | `value > 100` |
| `gte` | Greater than or equal | `value >= 100` |
| `lt` | Less than | `value < 100` |
| `lte` | Less than or equal | `value <= 100` |
| `contains` | Contains substring (case-insensitive) | `"hello world" contains "world"` |
| `notContains` | Does not contain substring | `"hello" notContains "world"` |
| `startsWith` | Starts with substring | `"hello world" startsWith "hello"` |
| `endsWith` | Ends with substring | `"hello world" endsWith "world"` |
| `isEmpty` | Is null, undefined, or empty string | `value isEmpty` |
| `isNotEmpty` | Has a value | `value isNotEmpty` |

#### Logic Operators

Combine multiple conditions with `AND` or `OR`:
- `AND`: All conditions must be true
- `OR`: At least one condition must be true

The `logic` property on a condition applies to the NEXT condition:
```json
[
  {"column": "status", "operator": "eq", "value": "active", "logic": "AND"},
  {"column": "priority", "operator": "gt", "value": 5}
]
```
This means: `status == "active" AND priority > 5`

#### Style Properties

| Property | Type | Example Values |
|----------|------|----------------|
| `backgroundColor` | CSS Color | `"#dcfce7"`, `"rgb(220, 252, 231)"`, `"lightgreen"` |
| `textColor` | CSS Color | `"#166534"`, `"#000000"`, `"darkgreen"` |
| `fontWeight` | CSS Font Weight | `"normal"`, `"bold"`, `"bolder"` |
| `fontStyle` | CSS Font Style | `"normal"`, `"italic"` |
| `textDecoration` | CSS Text Decoration | `"none"`, `"underline"`, `"line-through"` |

### 3. Global Table Styling

Configure overall table appearance:

| Property | Description | Example |
|----------|-------------|---------|
| `headerBackgroundColor` | Background color for table header | `"#f8fafc"` |
| `headerTextColor` | Text color for table header | `"#1e293b"` |
| `rowHoverColor` | Background color on row hover | `"#f1f5f9"` |
| `striped` | Enable alternating row colors | `true` |
| `bordered` | Show cell borders | `true` |

## Complete Examples

### Example 1: E-commerce Order Status Table

```json
{
  "columnConfigs": [
    {"key": "order_id", "label": "Order #", "visible": true, "width": "100px"},
    {"key": "customer", "label": "Customer", "visible": true},
    {"key": "amount", "label": "Amount", "visible": true, "width": "120px"},
    {"key": "status", "label": "Status", "visible": true, "width": "120px"},
    {"key": "internal_id", "label": "Internal ID", "visible": false}
  ],
  "formattingRules": [
    {
      "id": "highlight-completed",
      "name": "Highlight Completed Orders",
      "target": "row",
      "conditions": [
        {"column": "status", "operator": "eq", "value": "completed"}
      ],
      "style": {
        "backgroundColor": "#dcfce7",
        "textColor": "#166534"
      },
      "enabled": true
    },
    {
      "id": "highlight-pending",
      "name": "Highlight Pending Orders",
      "target": "row",
      "conditions": [
        {"column": "status", "operator": "eq", "value": "pending"}
      ],
      "style": {
        "backgroundColor": "#fef9c3",
        "textColor": "#854d0e"
      },
      "enabled": true
    },
    {
      "id": "highlight-cancelled",
      "name": "Highlight Cancelled Orders",
      "target": "row",
      "conditions": [
        {"column": "status", "operator": "eq", "value": "cancelled"}
      ],
      "style": {
        "backgroundColor": "#fee2e2",
        "textColor": "#991b1b",
        "fontStyle": "italic"
      },
      "enabled": true
    },
    {
      "id": "highlight-high-value",
      "name": "Highlight High Value",
      "target": "cell",
      "targetColumn": "amount",
      "conditions": [
        {"column": "amount", "operator": "gt", "value": 1000}
      ],
      "style": {
        "fontWeight": "bold",
        "textColor": "#059669"
      },
      "enabled": true
    }
  ],
  "headerBackgroundColor": "#f1f5f9",
  "headerTextColor": "#0f172a",
  "rowHoverColor": "#e2e8f0"
}
```

### Example 2: Inventory Management Table

```json
{
  "columnConfigs": [
    {"key": "sku", "label": "SKU", "visible": true, "width": "120px"},
    {"key": "product_name", "label": "Product", "visible": true},
    {"key": "stock_level", "label": "Stock", "visible": true, "width": "100px"},
    {"key": "reorder_point", "label": "Reorder At", "visible": true, "width": "100px"}
  ],
  "formattingRules": [
    {
      "id": "low-stock-warning",
      "name": "Low Stock Warning",
      "target": "row",
      "conditions": [
        {"column": "stock_level", "operator": "lt", "value": 10, "logic": "AND"},
        {"column": "stock_level", "operator": "gt", "value": 0}
      ],
      "style": {
        "backgroundColor": "#fef9c3",
        "textColor": "#854d0e"
      },
      "enabled": true
    },
    {
      "id": "out-of-stock",
      "name": "Out of Stock",
      "target": "row",
      "conditions": [
        {"column": "stock_level", "operator": "lte", "value": 0}
      ],
      "style": {
        "backgroundColor": "#fee2e2",
        "textColor": "#991b1b",
        "fontWeight": "bold"
      },
      "enabled": true
    },
    {
      "id": "below-reorder",
      "name": "Below Reorder Point",
      "target": "cell",
      "targetColumn": "stock_level",
      "conditions": [
        {"column": "stock_level", "operator": "lt", "value": "{{reorder_point}}"}
      ],
      "style": {
        "backgroundColor": "#fecaca",
        "fontWeight": "bold"
      },
      "enabled": true
    }
  ]
}
```

### Example 3: Performance Metrics Dashboard

```json
{
  "columnConfigs": [
    {"key": "metric_name", "label": "Metric", "visible": true},
    {"key": "current_value", "label": "Current", "visible": true, "width": "120px"},
    {"key": "target_value", "label": "Target", "visible": true, "width": "120px"},
    {"key": "trend", "label": "Trend", "visible": true, "width": "100px"}
  ],
  "formattingRules": [
    {
      "id": "exceeding-target",
      "name": "Exceeding Target",
      "target": "cell",
      "targetColumn": "current_value",
      "conditions": [
        {"column": "current_value", "operator": "gte", "value": "{{target_value}}"}
      ],
      "style": {
        "backgroundColor": "#dcfce7",
        "textColor": "#166534",
        "fontWeight": "bold"
      },
      "enabled": true
    },
    {
      "id": "below-target",
      "name": "Below Target",
      "target": "cell",
      "targetColumn": "current_value",
      "conditions": [
        {"column": "current_value", "operator": "lt", "value": "{{target_value}}"}
      ],
      "style": {
        "backgroundColor": "#fee2e2",
        "textColor": "#991b1b"
      },
      "enabled": true
    },
    {
      "id": "positive-trend",
      "name": "Positive Trend",
      "target": "cell",
      "targetColumn": "trend",
      "conditions": [
        {"column": "trend", "operator": "eq", "value": "up"}
      ],
      "style": {
        "textColor": "#059669",
        "fontWeight": "bold"
      },
      "enabled": true
    },
    {
      "id": "negative-trend",
      "name": "Negative Trend",
      "target": "cell",
      "targetColumn": "trend",
      "conditions": [
        {"column": "trend", "operator": "eq", "value": "down"}
      ],
      "style": {
        "textColor": "#dc2626",
        "fontWeight": "bold"
      },
      "enabled": true
    }
  ],
  "headerBackgroundColor": "#1e293b",
  "headerTextColor": "#f8fafc"
}
```

## Usage in the Editor

### Step 1: Add a Table Component
1. Drag a Table component from the palette onto your canvas
2. Configure the data source (SQL Query, URL, or Static Data)

### Step 2: Configure Column Visibility
1. Select the table component
2. In the Property Panel, find "Column Configuration"
3. Enter a JSON array with column configs:
   ```json
   [
     {"key": "id", "label": "ID", "visible": true},
     {"key": "hidden_field", "label": "Hidden", "visible": false}
   ]
   ```

### Step 3: Add Formatting Rules
1. In the Property Panel, find "Formatting Rules"
2. Enter a JSON array of formatting rules
3. Each rule can target rows or specific cells
4. Use multiple conditions with AND/OR logic

### Step 4: Customize Appearance
1. Set "Header Background" and "Header Text Color" for custom header styling
2. Set "Row Hover Color" for interactive hover effects
3. Toggle "Striped Rows" and "Bordered" options

## Tips and Best Practices

### Performance
- **Limit the number of rules**: Each rule is evaluated for every row. Keep rules focused and minimal.
- **Use cell-targeting wisely**: Cell-level rules are evaluated per cell, so they're more expensive than row-level rules.

### Rule Priority
- Rules are evaluated in order
- Later rules override earlier rules if they conflict
- Use rule ordering strategically for complex logic

### Color Selection
- Use consistent color schemes for better UX
- Consider accessibility: ensure sufficient contrast
- Common color schemes:
  - Success: `#dcfce7` (bg) + `#166534` (text)
  - Warning: `#fef9c3` (bg) + `#854d0e` (text)
  - Error: `#fee2e2` (bg) + `#991b1b` (text)
  - Info: `#dbeafe` (bg) + `#1e40af` (text)

### Complex Logic
For complex conditions, combine multiple rules:
```json
[
  {
    "id": "high-priority-urgent",
    "conditions": [
      {"column": "priority", "operator": "eq", "value": "high", "logic": "AND"},
      {"column": "days_old", "operator": "gt", "value": 7}
    ],
    "style": {"backgroundColor": "#fee2e2"}
  }
]
```

### Testing
1. Start with simple rules and test thoroughly
2. Use the browser console to check for errors in rule evaluation
3. Verify rules work with various data scenarios

## Troubleshooting

### Rules Not Applying
- Check that `enabled` is set to `true`
- Verify column names match your data exactly (case-sensitive)
- Ensure the JSON syntax is valid
- Check browser console for error messages

### Column Visibility Not Working
- Verify the column `key` matches the data field name
- Check that `visible` is explicitly set to `false` to hide columns
- If no columnConfigs are provided, all columns are visible by default

### Colors Not Showing
- Use valid CSS color values
- Check for conflicting rules (later rules override earlier ones)
- Verify the conditions are being met

## API Reference

### FormatCondition
```typescript
interface FormatCondition {
  column: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 
           'contains' | 'notContains' | 'startsWith' | 'endsWith' | 
           'isEmpty' | 'isNotEmpty'
  value?: any
  logic?: 'AND' | 'OR'
}
```

### FormatStyle
```typescript
interface FormatStyle {
  backgroundColor?: string
  textColor?: string
  fontWeight?: 'normal' | 'bold' | 'bolder'
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline' | 'line-through'
}
```

### FormattingRule
```typescript
interface FormattingRule {
  id: string
  name: string
  target: 'row' | 'cell'
  targetColumn?: string  // Required if target is 'cell'
  conditions: FormatCondition[]
  style: FormatStyle
  enabled: boolean
}
```

### ColumnConfig
```typescript
interface ColumnConfig {
  key: string
  label: string
  visible: boolean
  width?: string
}
```

## Version History

### v1.0.0 (Current)
- Initial release of enhanced table formatting
- Column visibility configuration
- Logic-based row and cell formatting
- Support for 12 comparison operators
- AND/OR logic combinations
- Custom header and hover styling

