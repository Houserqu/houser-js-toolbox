import {
  type ColumnDef,
  type ConvertResult,
  stripComments,
  extractTableName,
  extractTableBody,
  splitColumnDefs,
  extractPrimaryKeys,
  parseColumnDef,
  snakeToPascal,
} from './converter'

function sqlTypeToTsType(rawType: string): string {
  if (/^tinyint\s*\(\s*1\s*\)/i.test(rawType)) return 'boolean'

  const base = rawType
    .toLowerCase()
    .replace(/\s*\([^)]*\)/, '')
    .replace(/\s+unsigned\s*$/i, '')
    .trim()

  if (
    [
      'tinyint', 'smallint', 'mediumint', 'int', 'integer', 'int2', 'int4', 'serial',
      'bigint', 'int8', 'bigserial',
      'float', 'real', 'float4',
      'double', 'double precision', 'decimal', 'numeric', 'float8',
    ].includes(base)
  )
    return 'number'

  if (
    [
      'varchar', 'char', 'character varying', 'text',
      'tinytext', 'mediumtext', 'longtext',
      'uuid', 'enum', 'set',
    ].includes(base)
  )
    return 'string'

  if (['json', 'jsonb'].includes(base)) return 'unknown'

  if (
    [
      'datetime', 'timestamp', 'timestamptz',
      'timestamp with time zone', 'timestamp without time zone',
      'date', 'time',
    ].includes(base)
  )
    return 'Date'

  if (['bool', 'boolean'].includes(base)) return 'boolean'

  if (['blob', 'mediumblob', 'longblob', 'tinyblob', 'binary', 'varbinary', 'bytea'].includes(base))
    return 'Uint8Array'

  return 'string'
}

export function sqlToTs(sql: string, format: 'type' | 'interface'): ConvertResult {
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

  const typeName = snakeToPascal(tableName)
  const maxNameLen = Math.max(...columns.map(c => c.name.length))

  const fields = columns.map(col => {
    const tsType = sqlTypeToTsType(col.rawType)
    const nullable = !col.isPrimaryKey && !col.isNotNull
    const typeStr = nullable ? `${tsType} | null` : tsType
    return `  ${col.name.padEnd(maxNameLen)}: ${typeStr}`
  })

  const opening = format === 'interface' ? `export interface ${typeName} {` : `export type ${typeName} = {`
  return { code: [opening, ...fields, '}'].join('\n') }
}
