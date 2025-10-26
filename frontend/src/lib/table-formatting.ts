import type { FormatCondition, FormattingRule, FormatStyle } from '@/components/Editor/types'

/**
 * Evaluates a single condition against a data row
 */
export function evaluateCondition(
  condition: FormatCondition,
  row: Record<string, any>
): boolean {
  const columnValue = row[condition.column]
  const compareValue = condition.value

  switch (condition.operator) {
    case 'eq':
      return columnValue == compareValue // Loose equality for type flexibility
    
    case 'neq':
      return columnValue != compareValue
    
    case 'gt':
      return Number(columnValue) > Number(compareValue)
    
    case 'gte':
      return Number(columnValue) >= Number(compareValue)
    
    case 'lt':
      return Number(columnValue) < Number(compareValue)
    
    case 'lte':
      return Number(columnValue) <= Number(compareValue)
    
    case 'contains':
      return String(columnValue).toLowerCase().includes(String(compareValue).toLowerCase())
    
    case 'notContains':
      return !String(columnValue).toLowerCase().includes(String(compareValue).toLowerCase())
    
    case 'startsWith':
      return String(columnValue).toLowerCase().startsWith(String(compareValue).toLowerCase())
    
    case 'endsWith':
      return String(columnValue).toLowerCase().endsWith(String(compareValue).toLowerCase())
    
    case 'isEmpty':
      return columnValue === null || columnValue === undefined || columnValue === ''
    
    case 'isNotEmpty':
      return columnValue !== null && columnValue !== undefined && columnValue !== ''
    
    default:
      return false
  }
}

/**
 * Evaluates all conditions in a rule using AND/OR logic
 */
export function evaluateRule(
  rule: FormattingRule,
  row: Record<string, any>
): boolean {
  if (!rule.enabled || rule.conditions.length === 0) {
    return false
  }

  let result = evaluateCondition(rule.conditions[0], row)

  for (let i = 1; i < rule.conditions.length; i++) {
    const prevLogic = rule.conditions[i - 1].logic || 'AND'
    const currentResult = evaluateCondition(rule.conditions[i], row)

    if (prevLogic === 'AND') {
      result = result && currentResult
    } else {
      result = result || currentResult
    }
  }

  return result
}

/**
 * Gets the formatting style for a row based on all applicable rules
 * Later rules override earlier rules if they conflict
 */
export function getRowFormatting(
  row: Record<string, any>,
  rules: FormattingRule[]
): FormatStyle | null {
  const rowRules = rules.filter(rule => rule.target === 'row')
  let combinedStyle: FormatStyle = {}
  let hasAnyStyle = false

  for (const rule of rowRules) {
    if (evaluateRule(rule, row)) {
      combinedStyle = { ...combinedStyle, ...rule.style }
      hasAnyStyle = true
    }
  }

  return hasAnyStyle ? combinedStyle : null
}

/**
 * Gets the formatting style for a specific cell based on all applicable rules
 * Later rules override earlier rules if they conflict
 */
export function getCellFormatting(
  row: Record<string, any>,
  columnKey: string,
  rules: FormattingRule[]
): FormatStyle | null {
  const cellRules = rules.filter(
    rule => rule.target === 'cell' && rule.targetColumn === columnKey
  )
  let combinedStyle: FormatStyle = {}
  let hasAnyStyle = false

  for (const rule of cellRules) {
    if (evaluateRule(rule, row)) {
      combinedStyle = { ...combinedStyle, ...rule.style }
      hasAnyStyle = true
    }
  }

  return hasAnyStyle ? combinedStyle : null
}

/**
 * Converts a FormatStyle object to inline CSS styles
 */
export function formatStyleToCSS(style: FormatStyle): React.CSSProperties {
  return {
    backgroundColor: style.backgroundColor,
    color: style.textColor,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
  }
}

/**
 * Helper to merge multiple CSS style objects
 */
export function mergeStyles(
  ...styles: (React.CSSProperties | null | undefined)[]
): React.CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean))
}

