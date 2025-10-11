# Table Formatting: Quick Reference & Examples

## Quick Start Templates

### Template 1: Status-Based Row Coloring

Perfect for order tracking, task management, or any status-driven data:

```json
{
  "formattingRules": [
    {
      "id": "status-success",
      "name": "Success Status",
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
      "id": "status-warning",
      "name": "Warning Status",
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
      "id": "status-error",
      "name": "Error Status",
      "target": "row",
      "conditions": [
        {"column": "status", "operator": "eq", "value": "failed"}
      ],
      "style": {
        "backgroundColor": "#fee2e2",
        "textColor": "#991b1b"
      },
      "enabled": true
    }
  ]
}
```

### Template 2: Numeric Threshold Highlighting

Perfect for sales data, metrics, or any numeric indicators:

```json
{
  "formattingRules": [
    {
      "id": "high-value",
      "name": "High Value (>1000)",
      "target": "cell",
      "targetColumn": "amount",
      "conditions": [
        {"column": "amount", "operator": "gt", "value": 1000}
      ],
      "style": {
        "backgroundColor": "#dcfce7",
        "textColor": "#166534",
        "fontWeight": "bold"
      },
      "enabled": true
    },
    {
      "id": "medium-value",
      "name": "Medium Value (500-1000)",
      "target": "cell",
      "targetColumn": "amount",
      "conditions": [
        {"column": "amount", "operator": "gte", "value": 500, "logic": "AND"},
        {"column": "amount", "operator": "lte", "value": 1000}
      ],
      "style": {
        "textColor": "#2563eb",
        "fontWeight": "bold"
      },
      "enabled": true
    },
    {
      "id": "low-value",
      "name": "Low Value (<500)",
      "target": "cell",
      "targetColumn": "amount",
      "conditions": [
        {"column": "amount", "operator": "lt", "value": 500}
      ],
      "style": {
        "textColor": "#64748b",
        "fontStyle": "italic"
      },
      "enabled": true
    }
  ]
}
```

### Template 3: Text Search Highlighting

Perfect for filtering results, search interfaces, or keyword highlighting:

```json
{
  "formattingRules": [
    {
      "id": "contains-urgent",
      "name": "Contains 'urgent'",
      "target": "row",
      "conditions": [
        {"column": "description", "operator": "contains", "value": "urgent"}
      ],
      "style": {
        "backgroundColor": "#fef2f2",
        "textColor": "#991b1b"
      },
      "enabled": true
    },
    {
      "id": "contains-important",
      "name": "Contains 'important'",
      "target": "cell",
      "targetColumn": "description",
      "conditions": [
        {"column": "description", "operator": "contains", "value": "important"}
      ],
      "style": {
        "fontWeight": "bold",
        "textDecoration": "underline"
      },
      "enabled": true
    }
  ]
}
```

### Template 4: Empty/Missing Data Indicator

Perfect for data quality checks or identifying incomplete records:

```json
{
  "formattingRules": [
    {
      "id": "missing-email",
      "name": "Missing Email",
      "target": "cell",
      "targetColumn": "email",
      "conditions": [
        {"column": "email", "operator": "isEmpty"}
      ],
      "style": {
        "backgroundColor": "#fecaca",
        "textColor": "#991b1b",
        "fontStyle": "italic"
      },
      "enabled": true
    },
    {
      "id": "incomplete-row",
      "name": "Incomplete Row",
      "target": "row",
      "conditions": [
        {"column": "email", "operator": "isEmpty", "logic": "OR"},
        {"column": "phone", "operator": "isEmpty"}
      ],
      "style": {
        "backgroundColor": "#fef9c3"
      },
      "enabled": true
    }
  ]
}
```

### Template 5: Date-Based Formatting

Perfect for deadlines, expiration tracking, or time-sensitive data:

```json
{
  "formattingRules": [
    {
      "id": "overdue",
      "name": "Overdue Items",
      "target": "row",
      "conditions": [
        {"column": "days_overdue", "operator": "gt", "value": 0}
      ],
      "style": {
        "backgroundColor": "#fee2e2",
        "textColor": "#991b1b",
        "fontWeight": "bold"
      },
      "enabled": true
    },
    {
      "id": "due-soon",
      "name": "Due Within 3 Days",
      "target": "row",
      "conditions": [
        {"column": "days_until_due", "operator": "lte", "value": 3, "logic": "AND"},
        {"column": "days_until_due", "operator": "gte", "value": 0}
      ],
      "style": {
        "backgroundColor": "#fef9c3",
        "textColor": "#854d0e"
      },
      "enabled": true
    }
  ]
}
```

## Common Use Cases

### Use Case: E-commerce Dashboard

**Scenario**: Display orders with visual indicators for status and high-value orders

```json
{
  "columnConfigs": [
    {"key": "order_id", "label": "Order #", "visible": true, "width": "100px"},
    {"key": "customer_name", "label": "Customer", "visible": true},
    {"key": "total", "label": "Total", "visible": true, "width": "120px"},
    {"key": "status", "label": "Status", "visible": true, "width": "120px"},
    {"key": "internal_notes", "label": "Internal Notes", "visible": false}
  ],
  "formattingRules": [
    {
      "id": "completed",
      "name": "Completed Orders",
      "target": "row",
      "conditions": [
        {"column": "status", "operator": "eq", "value": "completed"}
      ],
      "style": {"backgroundColor": "#dcfce7"},
      "enabled": true
    },
    {
      "id": "high-value",
      "name": "High Value Orders",
      "target": "cell",
      "targetColumn": "total",
      "conditions": [
        {"column": "total", "operator": "gt", "value": 500}
      ],
      "style": {
        "backgroundColor": "#dbeafe",
        "fontWeight": "bold"
      },
      "enabled": true
    }
  ],
  "headerBackgroundColor": "#f1f5f9",
  "rowHoverColor": "#e2e8f0",
  "striped": true,
  "bordered": true
}
```

### Use Case: Inventory Management

**Scenario**: Alert on low stock and highlight items needing reorder

```json
{
  "columnConfigs": [
    {"key": "sku", "label": "SKU", "visible": true, "width": "120px"},
    {"key": "name", "label": "Product", "visible": true},
    {"key": "stock", "label": "In Stock", "visible": true, "width": "100px"},
    {"key": "min_stock", "label": "Min", "visible": true, "width": "80px"}
  ],
  "formattingRules": [
    {
      "id": "out-of-stock",
      "name": "Out of Stock",
      "target": "row",
      "conditions": [
        {"column": "stock", "operator": "lte", "value": 0}
      ],
      "style": {
        "backgroundColor": "#fee2e2",
        "textColor": "#991b1b",
        "fontWeight": "bold"
      },
      "enabled": true
    },
    {
      "id": "low-stock",
      "name": "Low Stock",
      "target": "cell",
      "targetColumn": "stock",
      "conditions": [
        {"column": "stock", "operator": "lte", "value": 10, "logic": "AND"},
        {"column": "stock", "operator": "gt", "value": 0}
      ],
      "style": {
        "backgroundColor": "#fef9c3",
        "fontWeight": "bold"
      },
      "enabled": true
    }
  ],
  "headerBackgroundColor": "#1e293b",
  "headerTextColor": "#f8fafc"
}
```

### Use Case: Customer Support Tickets

**Scenario**: Prioritize tickets by urgency and response time

```json
{
  "columnConfigs": [
    {"key": "ticket_id", "label": "Ticket", "visible": true, "width": "100px"},
    {"key": "subject", "label": "Subject", "visible": true},
    {"key": "priority", "label": "Priority", "visible": true, "width": "100px"},
    {"key": "hours_open", "label": "Hours Open", "visible": true, "width": "120px"}
  ],
  "formattingRules": [
    {
      "id": "critical-priority",
      "name": "Critical Priority",
      "target": "row",
      "conditions": [
        {"column": "priority", "operator": "eq", "value": "critical"}
      ],
      "style": {
        "backgroundColor": "#fee2e2",
        "textColor": "#991b1b",
        "fontWeight": "bold"
      },
      "enabled": true
    },
    {
      "id": "overdue-response",
      "name": "Overdue Response",
      "target": "cell",
      "targetColumn": "hours_open",
      "conditions": [
        {"column": "hours_open", "operator": "gt", "value": 24}
      ],
      "style": {
        "backgroundColor": "#fecaca",
        "fontWeight": "bold"
      },
      "enabled": true
    },
    {
      "id": "high-priority-overdue",
      "name": "High Priority + Overdue",
      "target": "row",
      "conditions": [
        {"column": "priority", "operator": "eq", "value": "high", "logic": "AND"},
        {"column": "hours_open", "operator": "gt", "value": 12}
      ],
      "style": {
        "backgroundColor": "#fef9c3",
        "fontWeight": "bold"
      },
      "enabled": true
    }
  ]
}
```

### Use Case: Financial Report

**Scenario**: Highlight profits, losses, and significant changes

```json
{
  "columnConfigs": [
    {"key": "account", "label": "Account", "visible": true},
    {"key": "revenue", "label": "Revenue", "visible": true, "width": "120px"},
    {"key": "expenses", "label": "Expenses", "visible": true, "width": "120px"},
    {"key": "profit", "label": "Profit/Loss", "visible": true, "width": "120px"},
    {"key": "change_pct", "label": "Change %", "visible": true, "width": "100px"}
  ],
  "formattingRules": [
    {
      "id": "positive-profit",
      "name": "Profit",
      "target": "cell",
      "targetColumn": "profit",
      "conditions": [
        {"column": "profit", "operator": "gt", "value": 0}
      ],
      "style": {
        "textColor": "#166534",
        "fontWeight": "bold"
      },
      "enabled": true
    },
    {
      "id": "negative-profit",
      "name": "Loss",
      "target": "cell",
      "targetColumn": "profit",
      "conditions": [
        {"column": "profit", "operator": "lt", "value": 0}
      ],
      "style": {
        "textColor": "#991b1b",
        "fontWeight": "bold"
      },
      "enabled": true
    },
    {
      "id": "significant-change",
      "name": "Significant Change",
      "target": "cell",
      "targetColumn": "change_pct",
      "conditions": [
        {"column": "change_pct", "operator": "gt", "value": 20, "logic": "OR"},
        {"column": "change_pct", "operator": "lt", "value": -20}
      ],
      "style": {
        "backgroundColor": "#fef9c3",
        "fontWeight": "bold"
      },
      "enabled": true
    }
  ],
  "striped": false,
  "bordered": true
}
```

### Use Case: User Activity Log

**Scenario**: Identify suspicious activities and important events

```json
{
  "columnConfigs": [
    {"key": "timestamp", "label": "Time", "visible": true, "width": "180px"},
    {"key": "user", "label": "User", "visible": true, "width": "150px"},
    {"key": "action", "label": "Action", "visible": true},
    {"key": "ip_address", "label": "IP", "visible": true, "width": "130px"}
  ],
  "formattingRules": [
    {
      "id": "failed-login",
      "name": "Failed Login Attempts",
      "target": "row",
      "conditions": [
        {"column": "action", "operator": "contains", "value": "failed login"}
      ],
      "style": {
        "backgroundColor": "#fee2e2",
        "textColor": "#991b1b"
      },
      "enabled": true
    },
    {
      "id": "admin-actions",
      "name": "Admin Actions",
      "target": "row",
      "conditions": [
        {"column": "action", "operator": "contains", "value": "admin"}
      ],
      "style": {
        "backgroundColor": "#dbeafe",
        "fontWeight": "bold"
      },
      "enabled": true
    },
    {
      "id": "delete-actions",
      "name": "Delete Actions",
      "target": "cell",
      "targetColumn": "action",
      "conditions": [
        {"column": "action", "operator": "contains", "value": "delete"}
      ],
      "style": {
        "textColor": "#dc2626",
        "fontWeight": "bold"
      },
      "enabled": true
    }
  ]
}
```

## Color Palette Reference

### Success/Positive States
- Light: `#dcfce7` (bg) + `#166534` (text)
- Medium: `#86efac` (bg) + `#15803d` (text)
- Dark: `#22c55e` (bg) + `#ffffff` (text)

### Warning/Caution States
- Light: `#fef9c3` (bg) + `#854d0e` (text)
- Medium: `#fde047` (bg) + `#713f12` (text)
- Dark: `#eab308` (bg) + `#ffffff` (text)

### Error/Danger States
- Light: `#fee2e2` (bg) + `#991b1b` (text)
- Medium: `#fecaca` (bg) + `#7f1d1d` (text)
- Dark: `#ef4444` (bg) + `#ffffff` (text)

### Info/Neutral States
- Light: `#dbeafe` (bg) + `#1e40af` (text)
- Medium: `#93c5fd` (bg) + `#1e3a8a` (text)
- Dark: `#3b82f6` (bg) + `#ffffff` (text)

### Gray/Inactive States
- Light: `#f1f5f9` (bg) + `#475569` (text)
- Medium: `#cbd5e1` (bg) + `#334155` (text)
- Dark: `#64748b` (bg) + `#ffffff` (text)

## Pro Tips

### 1. Zebra Striping with Custom Colors
Use row formatting for fully custom zebra striping:
```json
{
  "striped": false,
  "formattingRules": [
    {
      "id": "even-rows",
      "name": "Even Rows",
      "target": "row",
      "conditions": [
        {"column": "row_index", "operator": "eq", "value": "even"}
      ],
      "style": {"backgroundColor": "#f8fafc"},
      "enabled": true
    }
  ]
}
```

### 2. Multi-Column Highlighting
Highlight multiple cells in a row with the same condition:
```json
[
  {
    "id": "highlight-price",
    "target": "cell",
    "targetColumn": "price",
    "conditions": [{"column": "discount", "operator": "gt", "value": 0}],
    "style": {"textColor": "#16a34a", "fontWeight": "bold"}
  },
  {
    "id": "highlight-discount",
    "target": "cell",
    "targetColumn": "discount",
    "conditions": [{"column": "discount", "operator": "gt", "value": 0}],
    "style": {"backgroundColor": "#dcfce7", "fontWeight": "bold"}
  }
]
```

### 3. Progressive Severity Indicators
Use multiple rules to show escalating severity:
```json
[
  {"conditions": [{"column": "days_old", "operator": "gte", "value": 1}], "style": {"backgroundColor": "#fef9c3"}},
  {"conditions": [{"column": "days_old", "operator": "gte", "value": 3}], "style": {"backgroundColor": "#fed7aa"}},
  {"conditions": [{"column": "days_old", "operator": "gte", "value": 7}], "style": {"backgroundColor": "#fecaca"}},
  {"conditions": [{"column": "days_old", "operator": "gte", "value": 14}], "style": {"backgroundColor": "#fee2e2", "fontWeight": "bold"}}
]
```

### 4. Combine Row and Cell Formatting
Use row formatting for general status, cell formatting for specific values:
```json
[
  {
    "id": "row-status",
    "target": "row",
    "conditions": [{"column": "status", "operator": "eq", "value": "warning"}],
    "style": {"backgroundColor": "#fef9c3"}
  },
  {
    "id": "cell-value",
    "target": "cell",
    "targetColumn": "value",
    "conditions": [{"column": "value", "operator": "gt", "value": 100}],
    "style": {"fontWeight": "bold", "textColor": "#dc2626"}
  }
]
```

## Testing Your Rules

1. **Start Simple**: Begin with one rule and verify it works
2. **Check the Data**: Ensure column names match exactly
3. **Test Edge Cases**: Empty values, zeros, negative numbers
4. **Verify Priority**: If rules conflict, later rules win
5. **Use Browser Console**: Check for JavaScript errors

## Performance Guidelines

- **Optimal**: < 10 rules for tables with < 1000 rows
- **Good**: < 25 rules for tables with < 500 rows  
- **Acceptable**: < 50 rules for tables with < 100 rows
- **Use Pagination**: For large datasets, implement server-side pagination

