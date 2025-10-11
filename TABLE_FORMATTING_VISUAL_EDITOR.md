# Table Formatting: Visual Editor Guide

## Overview

The table formatting feature now includes **visual editors** that make it easy to configure complex formatting rules and column settings without writing JSON by hand.

## Visual Editors

### 1. Column Configuration Manager

**Location**: Property Panel > Data Tab > "Column Configuration"

The Column Configuration Manager provides a visual interface to:
- Show/hide columns
- Rename column labels
- Set column widths
- Reorder columns

#### How to Use

1. **Select your table** component on the canvas
2. **Navigate to the Data tab** in the Property Panel
3. **Set up your data source** first (SQL Query, URL, or Static Data)
4. **Click "Configure Columns"** button
   - Shows how many columns are visible/hidden
5. **In the dialog**:
   - **Toggle visibility** with the switch on each row
   - **Edit labels** to change how column headers appear
   - **Set widths** using CSS units (e.g., "100px", "15%")
   - **Reorder** using ↑ and ↓ buttons
6. **Use quick actions**:
   - "Show All" - Make all columns visible
   - "Hide All" - Hide all columns
   - "Reset Labels" - Restore default labels
7. **Click "Save Configuration"**

#### Example Use Cases

**Hide Internal Columns:**
```
✓ id (Show)
✓ customer_name (Show)
✓ email (Show)
✗ internal_notes (Hidden)
✗ created_by_user_id (Hidden)
```

**Custom Labels:**
```
id → "Order #"
customer_name → "Customer"
total_amount → "Total ($)"
```

**Fixed Column Widths:**
```
id: "80px"
status: "120px"
customer_name: "200px"
total_amount: "150px"
```

---

### 2. Formatting Rules Manager

**Location**: Property Panel > Style Tab > "Formatting Rules"

The Formatting Rules Manager provides a visual interface to:
- Create conditional formatting rules
- Define fuzzy logic conditions
- Apply custom styling
- Enable/disable rules

#### How to Use

1. **Select your table** component
2. **Navigate to the Style tab** in the Property Panel
3. **Ensure data is configured** so the editor knows available columns
4. **Click "+ Add Formatting Rule"**
5. **In the rule editor**:

   **a. Basic Settings:**
   - **Rule Name**: Give it a descriptive name (e.g., "Highlight Overdue")
   - **Apply To**: Choose "Entire Row" or "Specific Cell"
   - **Target Column**: If cell-specific, select which column

   **b. Conditions:**
   - Click "+ Add Condition" to add logic
   - For each condition:
     - **Column**: Select which column to check
     - **Operator**: Choose comparison (=, >, <, contains, etc.)
     - **Value**: Enter the comparison value
     - **Logic**: Choose AND/OR for multiple conditions

   **c. Styling:**
   - **Background Color**: Use color picker or enter hex code
   - **Text Color**: Set text color
   - **Font Weight**: Normal, Bold, or Bolder
   - **Font Style**: Normal or Italic
   - **Text Decoration**: None, Underline, or Line-through

6. **Click "Save Rule"**

#### Visual Rule Builder

The visual interface automatically handles:
- ✅ JSON syntax
- ✅ Proper quoting and escaping
- ✅ Operator selection
- ✅ Color picking
- ✅ Validation

You never have to write JSON manually!

---

## Complete Workflow Example

Let's create a fully formatted table step-by-step:

### Step 1: Create and Configure Data

1. Drag a **Table** component onto the canvas
2. In **Data Tab**:
   - Set "Data Source Type" to "SQL Query"
   - Select your query
   - Data loads automatically

### Step 2: Configure Columns

1. Click **"Configure Columns"**
2. Hide unnecessary columns:
   - Hide "internal_id"
   - Hide "created_at"
3. Rename columns:
   - "customer_name" → "Customer"
   - "order_total" → "Total"
   - "order_status" → "Status"
4. Set widths:
   - "order_id": "100px"
   - "order_status": "120px"
5. Click **"Save Configuration"**

### Step 3: Add Formatting Rules

**Rule 1: Highlight Completed Orders**
1. Click **"+ Add Formatting Rule"**
2. Name: "Completed Orders"
3. Apply To: "Entire Row"
4. Conditions:
   - Column: "order_status"
   - Operator: "Equals (=)"
   - Value: "completed"
5. Styling:
   - Background: `#dcfce7` (light green)
   - Text Color: `#166534` (dark green)
6. Save

**Rule 2: Highlight High Value Orders**
1. Click **"+ Add Formatting Rule"**
2. Name: "High Value"
3. Apply To: "Specific Cell"
4. Target Column: "order_total"
5. Conditions:
   - Column: "order_total"
   - Operator: "Greater Than (>)"
   - Value: "1000"
6. Styling:
   - Background: `#dbeafe` (light blue)
   - Font Weight: "Bold"
7. Save

**Rule 3: Highlight Urgent and High Priority**
1. Click **"+ Add Formatting Rule"**
2. Name: "Urgent High Priority"
3. Apply To: "Entire Row"
4. Conditions:
   - Condition 1:
     - Column: "priority"
     - Operator: "Equals (=)"
     - Value: "high"
     - Logic: "AND"
   - Condition 2:
     - Column: "is_urgent"
     - Operator: "Equals (=)"
     - Value: "true"
5. Styling:
   - Background: `#fee2e2` (light red)
   - Text Color: `#991b1b` (dark red)
   - Font Weight: "Bold"
6. Save

### Step 4: Customize Table Appearance

In the **Style Tab**:
- Header Background: `#1e293b` (dark gray)
- Header Text Color: `#f8fafc` (light gray)
- Row Hover Color: `#e2e8f0` (light hover)
- Striped Rows: ✓ Enabled
- Bordered: ✓ Enabled

---

## Tips for Using the Visual Editors

### Column Configuration

✅ **DO:**
- Set up data source before configuring columns
- Use consistent width units (px or %)
- Give columns clear, user-friendly labels
- Hide sensitive or internal-only fields

❌ **DON'T:**
- Hide all columns (at least one must be visible)
- Use very large width values that break layout
- Change configuration while data is loading

### Formatting Rules

✅ **DO:**
- Give rules descriptive names
- Test rules with sample data
- Use color schemes consistently
- Start with simple rules and add complexity
- Use the Enable/Disable toggle to test rules

❌ **DON'T:**
- Create too many overlapping rules
- Use colors with poor contrast
- Forget to save after editing
- Use complex multi-condition rules without testing

---

## Troubleshooting

### "No columns available yet"

**Problem**: The column configuration or formatting rule editor shows no columns.

**Solutions**:
1. Configure your data source first (query, URL, or static data)
2. Ensure your data source returns valid data
3. Check that your SQL query executes successfully
4. For API endpoints, verify the URL is correct

### Rules not applying

**Problem**: Rules are created but formatting doesn't appear.

**Solutions**:
1. Check that the rule is **Enabled** (toggle should be on)
2. Verify column names match exactly (case-sensitive)
3. Check that your conditions match actual data values
4. Review browser console for error messages
5. Test with simpler conditions first

### Dialog won't close

**Problem**: Can't close the column or formatting dialog.

**Solutions**:
1. Press **Escape** key
2. Click on the dark background outside the dialog
3. Click the "Cancel" or "X" button

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close open dialog |
| `Enter` | Save (when focused on input) |
| `Tab` | Navigate between fields |

---

## Advanced Features

### Dynamic Values

While the visual editor doesn't support dynamic values directly, you can:
1. Create the rule in the visual editor
2. Note the structure and values
3. Switch to JSON mode if needed for advanced customization

### Rule Priority

Rules are applied in order from top to bottom. Later rules override earlier ones when they conflict.

**In the list**:
- Rules appear in the order they're created
- Drag support coming soon
- For now: delete and recreate to reorder

### Bulk Operations

**Column Configuration**:
- "Show All" - Quick enable
- "Hide All" - Quick disable
- "Reset Labels" - Restore defaults

**Formatting Rules**:
- Toggle individual rules on/off
- Delete multiple by deleting one at a time
- Edit any rule by clicking "Edit"

---

## Comparison: Visual vs JSON

### Visual Editor Advantages
✅ No JSON syntax knowledge required
✅ Color pickers for easy color selection
✅ Dropdown menus for operators and options
✅ Immediate validation and error prevention
✅ Preview of current rules
✅ Easy to enable/disable rules for testing

### JSON Editor Advantages
✅ Faster for experts who know the structure
✅ Copy/paste between configurations
✅ Bulk editing with search/replace
✅ Version control friendly
✅ Can use advanced features not in UI yet

**Best Practice**: Use visual editor for creation and testing, then export to JSON if needed for version control or bulk operations.

---

## Getting Help

### Quick Reference
- **Operators Guide**: See TABLE_FORMATTING_FEATURE.md
- **Examples**: See TABLE_FORMATTING_EXAMPLES.md
- **Color Schemes**: Refer to color palette section in examples

### Common Questions

**Q: Can I edit the JSON directly?**
A: Not currently in the visual editor, but you can view the JSON in the component state.

**Q: How many rules can I create?**
A: Unlimited, but keep performance in mind (recommended < 25 for large tables).

**Q: Can I copy rules between tables?**
A: Not directly yet, but you can recreate similar rules using the visual editor.

**Q: Do rules apply to new data automatically?**
A: Yes! Rules are evaluated on every data load.

---

## Feature Roadmap

Coming soon:
- 🔄 Drag-and-drop rule reordering
- 📋 Copy/paste rules between tables
- 📊 Live preview of formatting in editor
- 🎨 Predefined color schemes
- 💾 Save rule templates for reuse
- 🔍 Search/filter rules
- 📈 Rule usage analytics

---

## Feedback

The visual editors are designed to make table formatting accessible to everyone. If you have suggestions or encounter issues, please provide feedback!

