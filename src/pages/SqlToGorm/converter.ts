export interface ConvertResult {
  code: string
  error?: string
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export function stripComments(sql: string): string {
  // Block comments /* ... */
  sql = sql.replace(/\/\*[\s\S]*?\*\//g, ' ')
  // Line comments -- ...
  sql = sql.replace(/--[^\n]*/g, '')
  return sql
}

export function snakeToPascal(name: string): string {
  return name
    .split('_')
    .filter(s => s.length > 0)
    .map(s => s[0].toUpperCase() + s.slice(1))
    .join('')
}

function unquoteIdentifier(s: string): string {
  return s.replace(/^[`"[\]]|[`"[\]]$/g, '').trim()
}

// ── SQL Structure Extraction ───────────────────────────────────────────────────

export function extractTableName(sql: string): string | null {
  const m = sql.match(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:[`"[\]]?[\w$]+[`"[\]]?\s*\.\s*)?[`"[\]]?(\w+)[`"[\]]?\s*\(/i,
  )
  return m ? m[1] : null
}

export function extractTableBody(sql: string): string | null {
  const start = sql.indexOf('(')
  if (start === -1) return null
  let depth = 0
  let end = -1
  for (let i = start; i < sql.length; i++) {
    if (sql[i] === '(') depth++
    else if (sql[i] === ')') {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  return end !== -1 ? sql.slice(start + 1, end) : null
}

/** Split column/constraint definitions by top-level commas, respecting parentheses and strings. */
export function splitColumnDefs(body: string): string[] {
  const parts: string[] = []
  let depth = 0
  let inString = false
  let stringChar = ''
  let current = ''

  for (let i = 0; i < body.length; i++) {
    const c = body[i]

    if (inString) {
      if (c === stringChar && body[i - 1] !== '\\') inString = false
      current += c
      continue
    }

    if (c === "'" || c === '"') {
      inString = true
      stringChar = c
      current += c
      continue
    }

    if (c === '(') {
      depth++
      current += c
    } else if (c === ')') {
      depth--
      current += c
    } else if (c === ',' && depth === 0) {
      const t = current.trim()
      if (t) parts.push(t)
      current = ''
    } else {
      current += c
    }
  }

  const t = current.trim()
  if (t) parts.push(t)
  return parts
}

/** Collect column names declared in table-level PRIMARY KEY constraints. */
export function extractPrimaryKeys(defs: string[]): Set<string> {
  const pks = new Set<string>()
  for (const def of defs) {
    const m = def.trim().match(/^PRIMARY\s+KEY\s*\(([^)]+)\)/i)
    if (m) {
      m[1].split(',').forEach(k => pks.add(unquoteIdentifier(k.trim())))
    }
  }
  return pks
}

// ── Type Mapping ──────────────────────────────────────────────────────────────

interface TypeResult {
  rawType: string
  remaining: string
}

function extractType(rest: string): TypeResult {
  // Multi-word types must be tried first (most specific → least specific)
  const multiWord = [
    /^(timestamp\s+with(?:out)?\s+time\s+zone\s*(?:\([^)]*\))?)/i,
    /^(character\s+varying\s*(?:\([^)]*\))?)/i,
    /^(double\s+precision)/i,
    /^(bit\s+varying\s*(?:\([^)]*\))?)/i,
  ]
  for (const pat of multiWord) {
    const m = rest.match(pat)
    if (m) return { rawType: m[1].trim(), remaining: rest.slice(m[0].length).trimStart() }
  }

  const m = rest.match(/^([\w]+\s*(?:\([^)]*\))?)/)
  if (m) return { rawType: m[1].trim(), remaining: rest.slice(m[0].length).trimStart() }

  return { rawType: '', remaining: rest }
}

function sqlTypeToGoType(rawType: string, colName: string): string {
  if (colName === 'deleted_at') return 'gorm.DeletedAt'

  // tinyint(1) is a boolean in MySQL convention
  if (/^tinyint\s*\(\s*1\s*\)/i.test(rawType)) return 'bool'

  const base = rawType
    .toLowerCase()
    .replace(/\s*\([^)]*\)/, '')
    .replace(/\s+unsigned\s*$/i, '')
    .trim()

  if (['tinyint', 'smallint', 'mediumint', 'int', 'integer', 'int2', 'int4', 'serial'].includes(base))
    return 'int32'
  if (['bigint', 'int8', 'bigserial'].includes(base)) return 'int64'
  if (
    [
      'varchar', 'char', 'character varying', 'text',
      'tinytext', 'mediumtext', 'longtext',
      'uuid', 'json', 'jsonb', 'enum', 'set',
    ].includes(base)
  )
    return 'string'
  if (['float', 'real', 'float4'].includes(base)) return 'float32'
  if (['double', 'double precision', 'decimal', 'numeric', 'float8'].includes(base)) return 'float64'
  if (
    [
      'datetime', 'timestamp', 'timestamptz',
      'timestamp with time zone', 'timestamp without time zone',
      'date', 'time',
    ].includes(base)
  )
    return 'time.Time'
  if (['bool', 'boolean'].includes(base)) return 'bool'
  if (['blob', 'mediumblob', 'longblob', 'tinyblob', 'binary', 'varbinary', 'bytea'].includes(base))
    return '[]byte'

  return 'string'
}

// ── Column Definition Parsing ─────────────────────────────────────────────────

export interface ColumnDef {
  name: string
  rawType: string
  goType: string
  isPrimaryKey: boolean
  isNotNull: boolean
  defaultValue?: string
  comment?: string
}

export function parseColumnDef(line: string, primaryKeys: Set<string>): ColumnDef | null {
  const trimmed = line.trim()
  if (!trimmed) return null

  // Skip table-level constraints
  if (
    /^(PRIMARY\s+KEY|UNIQUE\s*(?:KEY|INDEX)?|KEY\s|INDEX\s|CONSTRAINT\s|FOREIGN\s+KEY|CHECK\s*\()/i.test(
      trimmed,
    )
  )
    return null

  // Extract (optionally quoted) column name
  const nameMatch = trimmed.match(/^[`"[\[]?(\w+)[`"[\]]]?\s+/)
  if (!nameMatch) return null

  const name = nameMatch[1]
  const afterName = trimmed.slice(nameMatch[0].length)

  const { rawType, remaining } = extractType(afterName)
  if (!rawType) return null

  const isPrimaryKey = primaryKeys.has(name) || /\bPRIMARY\s+KEY\b/i.test(remaining)
  // Primary key implicitly NOT NULL – omit the explicit tag per example convention
  const isNotNull = !isPrimaryKey && /\bNOT\s+NULL\b/i.test(remaining)

  // DEFAULT value (skip NULL and empty-string defaults as they are noise in the gorm tag)
  let defaultValue: string | undefined
  const defMatch = remaining.match(
    /\bDEFAULT\s+('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\([^)]*\)|[\w.]+)/i,
  )
  if (defMatch) {
    const raw = defMatch[1].replace(/^['"]|['"]$/g, '')
    if (raw !== '' && raw.toUpperCase() !== 'NULL') defaultValue = raw
  }

  // COMMENT (MySQL)
  let comment: string | undefined
  const commentMatch = remaining.match(/\bCOMMENT\s+'((?:[^'\\]|\\.)*)'/i)
  if (commentMatch) comment = commentMatch[1]

  return {
    name,
    rawType: rawType.toLowerCase(),
    goType: sqlTypeToGoType(rawType, name),
    isPrimaryKey,
    isNotNull,
    defaultValue,
    comment,
  }
}

// ── Go Code Generation ────────────────────────────────────────────────────────

function buildGormTag(col: ColumnDef): string {
  const parts = [`column:${col.name}`, `type:${col.rawType}`]

  // gorm.DeletedAt only needs column + type
  if (col.goType === 'gorm.DeletedAt') return `gorm:"${parts.join(';')}"`

  if (col.isPrimaryKey) parts.push('primary_key')
  if (col.comment) parts.push(`comment:${col.comment}`)
  if (col.defaultValue) parts.push(`default:${col.defaultValue}`)
  if (col.isNotNull) parts.push('NOT NULL')

  return `gorm:"${parts.join(';')}"`
}

function buildJsonTag(col: ColumnDef): string {
  const suffix = col.goType === 'int64' ? ',string' : ''
  return `json:"${col.name}${suffix}"`
}

// ── Public Entry Point ────────────────────────────────────────────────────────

export function sqlToGorm(sql: string): ConvertResult {
  const cleaned = stripComments(sql).trim()
  if (!cleaned) return { code: '', error: '请输入 SQL 建表语句' }

  const tableName = extractTableName(cleaned)
  if (!tableName) return { code: '', error: '无法解析表名，请检查 SQL 语法是否为 CREATE TABLE 语句' }

  const body = extractTableBody(cleaned)
  if (!body) return { code: '', error: '无法解析表结构，请检查括号是否匹配' }

  const defs = splitColumnDefs(body)
  const primaryKeys = extractPrimaryKeys(defs)

  const columns: ColumnDef[] = []
  for (const def of defs) {
    const col = parseColumnDef(def, primaryKeys)
    if (col) columns.push(col)
  }

  if (columns.length === 0) return { code: '', error: '未能解析出任何字段，请检查列定义是否正确' }

  const structName = snakeToPascal(tableName)
  const needsTime = columns.some(c => c.goType === 'time.Time')
  const needsGorm = columns.some(c => c.goType === 'gorm.DeletedAt')

  // Alignment padding
  const maxNameLen = Math.max(...columns.map(c => snakeToPascal(c.name).length))
  const maxTypeLen = Math.max(...columns.map(c => c.goType.length))

  const fields = columns.map(col => {
    const fieldName = snakeToPascal(col.name)
    const paddedName = fieldName.padEnd(maxNameLen + 1)
    const paddedType = col.goType.padEnd(maxTypeLen + 1)
    return `\t${paddedName}${paddedType}\`${buildGormTag(col)} ${buildJsonTag(col)}\``
  })

  const lines: string[] = ['package model', '']

  if (needsTime || needsGorm) {
    lines.push('import (')
    if (needsTime) lines.push('\t"time"')
    if (needsTime && needsGorm) lines.push('')
    if (needsGorm) lines.push('\t"gorm.io/gorm"')
    lines.push(')')
    lines.push('')
  }

  lines.push(`type ${structName} struct {`)
  lines.push(...fields)
  lines.push('}')
  lines.push('')
  lines.push(`func (m *${structName}) TableName() string {`)
  lines.push(`\treturn "${tableName}"`)
  lines.push('}')

  return { code: lines.join('\n') }
}
