export interface ConvertResult {
  code: string
  error?: string
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)
}

function toPascalCase(s: string): string {
  return s.includes('_') ? s.split('_').filter(Boolean).map(capitalize).join('') : capitalize(s)
}

function openingTs(name: string, format: 'type' | 'interface'): string {
  return format === 'interface' ? `export interface ${name}` : `export type ${name} =`
}

// ── JSON → TypeScript (separate named types) ──────────────────────────────────

interface TsBlock { name: string; fields: string[] }

function inferTsType(value: unknown, typeName: string, blocks: TsBlock[]): string {
  if (value === null) return 'unknown | null'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]'
    return `${inferTsType(value[0], typeName, blocks)}[]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    const maxLen = entries.reduce((m, [k]) => Math.max(m, k.length), 0)
    const fields = entries.map(([k, v]) => `  ${k.padEnd(maxLen)}: ${inferTsType(v, toPascalCase(k), blocks)}`)
    blocks.push({ name: typeName, fields })
    return typeName
  }
  return 'unknown'
}

function renderTsBlocks(blocks: TsBlock[], format: 'type' | 'interface'): string[] {
  const lines: string[] = []
  for (const b of blocks) {
    lines.push(format === 'interface' ? `export interface ${b.name} {` : `export type ${b.name} = {`)
    lines.push(...b.fields)
    lines.push('}')
    lines.push('')
  }
  return lines
}

// ── JSON → TypeScript (inline nested) ────────────────────────────────────────

function inferTsTypeInline(value: unknown, depth: number): string {
  if (value === null) return 'unknown | null'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]'
    return `${inferTsTypeInline(value[0], depth)}[]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return 'Record<string, unknown>'
    const inner = '  '.repeat(depth + 1)
    const base = '  '.repeat(depth)
    const maxLen = entries.reduce((m, [k]) => Math.max(m, k.length), 0)
    const fields = entries.map(([k, v]) => `${inner}${k.padEnd(maxLen)}: ${inferTsTypeInline(v, depth + 1)}`)
    return `{\n${fields.join('\n')}\n${base}}`
  }
  return 'unknown'
}

// ── JSON → TypeScript (entry point) ──────────────────────────────────────────

export function jsonToTs(json: string, format: 'type' | 'interface', nested = false): ConvertResult {
  let parsed: unknown
  try { parsed = JSON.parse(json) } catch { return { code: '', error: '无效的 JSON，请检查语法' } }

  if (typeof parsed !== 'object' || parsed === null) {
    const t = parsed === null ? 'null' : typeof parsed === 'string' ? 'string' : typeof parsed === 'number' ? 'number' : 'boolean'
    return { code: `export type Root = ${t}` }
  }

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return { code: 'export type Root = unknown[]' }
    const elem = parsed[0]
    if (typeof elem !== 'object' || elem === null) {
      return { code: `export type Root = ${inferTsType(elem, '', [])}[]` }
    }
    if (nested) {
      const typeStr = inferTsTypeInline(elem, 0)
      return { code: `${openingTs('Root', format)} ${typeStr}\n\nexport type RootList = Root[]` }
    }
    const blocks: TsBlock[] = []
    inferTsType(elem, 'Root', blocks)
    blocks.reverse()
    const lines = renderTsBlocks(blocks, format)
    lines.push('export type RootList = Root[]')
    return { code: lines.join('\n').trimEnd() }
  }

  if (nested) {
    return { code: `${openingTs('Root', format)} ${inferTsTypeInline(parsed, 0)}` }
  }
  const blocks: TsBlock[] = []
  inferTsType(parsed, 'Root', blocks)
  blocks.reverse()
  return { code: renderTsBlocks(blocks, format).join('\n').trimEnd() }
}

// ── JSON → Golang struct (separate named types) ───────────────────────────────

interface GoField { name: string; goType: string; tag: string }
interface GoBlock { name: string; fields: GoField[] }

function inferGoType(value: unknown, typeName: string, blocks: GoBlock[]): string {
  if (value === null) return 'any'
  if (typeof value === 'boolean') return 'bool'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return Number.isInteger(value) ? 'int64' : 'float64'
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]any'
    return `[]${inferGoType(value[0], typeName, blocks)}`
  }
  if (typeof value === 'object') {
    const fields = Object.entries(value as Record<string, unknown>).map(([k, v]) => ({
      name: toPascalCase(k),
      goType: inferGoType(v, toPascalCase(k), blocks),
      tag: k,
    }))
    blocks.push({ name: typeName, fields })
    return typeName
  }
  return 'any'
}

function renderGoBlocks(blocks: GoBlock[]): string[] {
  const lines: string[] = []
  for (const b of blocks) {
    const maxName = b.fields.reduce((m, f) => Math.max(m, f.name.length), 0)
    const maxType = b.fields.reduce((m, f) => Math.max(m, f.goType.length), 0)
    lines.push(`type ${b.name} struct {`)
    for (const f of b.fields) {
      lines.push(`\t${f.name.padEnd(maxName + 1)}${f.goType.padEnd(maxType + 1)}\`json:"${f.tag}"\``)
    }
    lines.push('}')
    lines.push('')
  }
  return lines
}

// ── JSON → Golang struct (inline nested) ─────────────────────────────────────

function inferGoTypeInline(value: unknown, depth: number): string {
  if (value === null) return 'any'
  if (typeof value === 'boolean') return 'bool'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return Number.isInteger(value) ? 'int64' : 'float64'
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]any'
    return `[]${inferGoTypeInline(value[0], depth)}`
  }
  if (typeof value === 'object') {
    const inner = '\t'.repeat(depth + 1)
    const base = '\t'.repeat(depth)
    const fields = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) => `${inner}${toPascalCase(k)} ${inferGoTypeInline(v, depth + 1)} \`json:"${k}"\``,
    )
    return `struct {\n${fields.join('\n')}\n${base}}`
  }
  return 'any'
}

// ── JSON → Golang struct (entry point) ───────────────────────────────────────

export function jsonToGo(json: string, nested = false): ConvertResult {
  let parsed: unknown
  try { parsed = JSON.parse(json) } catch { return { code: '', error: '无效的 JSON，请检查语法' } }

  if (typeof parsed !== 'object' || parsed === null) {
    const t = typeof parsed === 'string' ? 'string' : typeof parsed === 'number' ? 'float64' : typeof parsed === 'boolean' ? 'bool' : 'any'
    return { code: `// Root is ${t}` }
  }

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return { code: 'type Root []any' }
    const elem = parsed[0]
    if (nested) {
      const typeStr = inferGoTypeInline(elem, 0)
      return { code: `type Root ${typeStr}\n\ntype RootList []Root` }
    }
    const blocks: GoBlock[] = []
    inferGoType(elem, 'Root', blocks)
    blocks.reverse()
    const lines = renderGoBlocks(blocks)
    lines.push('type RootList []Root')
    return { code: lines.join('\n').trimEnd() }
  }

  if (nested) {
    return { code: `type Root ${inferGoTypeInline(parsed, 0)}` }
  }
  const blocks: GoBlock[] = []
  inferGoType(parsed, 'Root', blocks)
  blocks.reverse()
  return { code: renderGoBlocks(blocks).join('\n').trimEnd() }
}

// ── TypeScript → Golang struct ─────────────────────────────────────────────────

function tsTypeToGo(t: string): string {
  t = t.trim()
  if (t.startsWith('(') && t.endsWith(')')) return tsTypeToGo(t.slice(1, -1))
  if (t.endsWith('[]')) return `[]${tsTypeToGo(t.slice(0, -2))}`
  const arrMatch = t.match(/^Array<(.+)>$/)
  if (arrMatch) return `[]${tsTypeToGo(arrMatch[1])}`
  const recMatch = t.match(/^Record<\w+,\s*(.+)>$/)
  if (recMatch) return `map[string]${tsTypeToGo(recMatch[1].trim())}`

  const parts = t.split(/\s*\|\s*/)
  const core = parts.filter(p => p !== 'null' && p !== 'undefined')
  if (core.length < parts.length) {
    if (core.length === 0) return 'any'
    if (core.length === 1) return `*${tsTypeToGo(core[0])}`
    return 'any'
  }
  if (parts.length > 1) return 'any'

  switch (t) {
    case 'string': return 'string'
    case 'number': return 'float64'
    case 'boolean': return 'bool'
    case 'Date': return 'time.Time'
    case 'any': case 'unknown': case 'null': case 'undefined':
    case 'void': case 'never': case 'object': return 'any'
    default: return t
  }
}

interface TsDef { typeName: string; fields: Array<{ name: string; tsType: string; optional: boolean }> }

function parseTsDefinitions(input: string): TsDef[] {
  const result: TsDef[] = []
  const re = /(?:export\s+)?(?:interface|type)\s+(\w+)\s*(?:<[^>]*>)?\s*(?:=\s*)?\{([^}]*)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(input)) !== null) {
    const fields = m[2]
      .split(/[;\n]/)
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//'))
      .flatMap(l => {
        const fm = l.match(/^(\w+)(\??)\s*:\s*(.+)$/)
        if (!fm) return []
        return [{ name: fm[1], optional: fm[2] === '?', tsType: fm[3].replace(/,$/, '').trim() }]
      })
    result.push({ typeName: m[1], fields })
  }
  return result
}

export function tsToGo(tsInput: string): ConvertResult {
  const defs = parseTsDefinitions(tsInput)
  if (defs.length === 0)
    return { code: '', error: '无法解析类型定义，请使用 interface Foo { ... } 或 type Foo = { ... } 格式（不支持内联嵌套对象）' }

  let needsTime = false
  const structLines: string[] = []

  for (const def of defs) {
    const fields = def.fields.map(f => {
      const isNullable = f.optional || f.tsType.includes('null') || f.tsType.includes('undefined')
      const goType = tsTypeToGo(f.tsType)
      if (goType === 'time.Time' || goType === '*time.Time') needsTime = true
      return { name: toPascalCase(f.name), goType, jsonTag: isNullable ? `${f.name},omitempty` : f.name }
    })
    const maxName = fields.reduce((m, f) => Math.max(m, f.name.length), 0)
    const maxType = fields.reduce((m, f) => Math.max(m, f.goType.length), 0)
    structLines.push(`type ${def.typeName} struct {`)
    for (const f of fields) {
      structLines.push(`\t${f.name.padEnd(maxName + 1)}${f.goType.padEnd(maxType + 1)}\`json:"${f.jsonTag}"\``)
    }
    structLines.push('}')
    structLines.push('')
  }

  const lines = needsTime ? ['import "time"', '', ...structLines] : structLines
  return { code: lines.join('\n').trimEnd() }
}

// ── Golang struct → TypeScript ─────────────────────────────────────────────────

function goTypeToTs(t: string): string {
  if (t === '[]byte') return 'string'
  if (t.startsWith('*')) return `${goTypeToTs(t.slice(1))} | null`
  if (t.startsWith('[]')) return `${goTypeToTs(t.slice(2))}[]`
  if (t.startsWith('map[')) return 'Record<string, unknown>'
  switch (t) {
    case 'string': case 'rune': case 'byte': return 'string'
    case 'int': case 'int8': case 'int16': case 'int32': case 'int64':
    case 'uint': case 'uint8': case 'uint16': case 'uint32': case 'uint64':
    case 'float32': case 'float64': case 'uintptr': return 'number'
    case 'bool': return 'boolean'
    case 'time.Time': return 'Date'
    case 'interface{}': case 'any': return 'unknown'
    default: return t
  }
}

function parseGoStructs(input: string) {
  const result: Array<{ typeName: string; fields: Array<{ name: string; goType: string; jsonTag: string | undefined }> }> = []
  const re = /type\s+(\w+)\s+struct\s*\{([^}]*)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(input)) !== null) {
    const fields = m[2]
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//'))
      .flatMap(l => {
        const fm = l.match(/^(\w+)\s+([^\s`]+)\s*(?:`([^`]*)`)?/)
        if (!fm) return []
        const tagStr = fm[3]?.match(/json:"([^"]*)"/)
        const rawTag = tagStr?.[1]
        if (rawTag === '-') return []
        const jsonTag = rawTag ? rawTag.split(',')[0] : undefined
        return [{ name: fm[1], goType: fm[2], jsonTag }]
      })
    result.push({ typeName: m[1], fields })
  }
  return result
}

export function goToTs(goInput: string, format: 'type' | 'interface'): ConvertResult {
  const defs = parseGoStructs(goInput)
  if (defs.length === 0)
    return { code: '', error: '无法解析 Go struct 定义，请使用 type Foo struct { ... } 格式' }

  const lines: string[] = []
  for (const def of defs) {
    const fields = def.fields.map(f => ({
      tsName: f.jsonTag ?? (f.name.charAt(0).toLowerCase() + f.name.slice(1)),
      tsType: goTypeToTs(f.goType),
    }))
    const maxLen = fields.reduce((m, f) => Math.max(m, f.tsName.length), 0)
    lines.push(format === 'interface' ? `export interface ${def.typeName} {` : `export type ${def.typeName} = {`)
    for (const f of fields) lines.push(`  ${f.tsName.padEnd(maxLen)}: ${f.tsType}`)
    lines.push('}')
    lines.push('')
  }
  return { code: lines.join('\n').trimEnd() }
}
