import { useEffect, useRef, useState } from 'react'
import { App, Button, Card, Input, Segmented, Space, Switch, Typography } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { useDebounceFn } from 'ahooks'
import { jsonToTs, jsonToGo, tsToGo, goToTs, type ConvertResult } from './converter'

const { TextArea } = Input
const { Title, Text } = Typography

type InputFormat = 'json' | 'ts' | 'go'
type OutputFormat = 'ts-type' | 'ts-interface' | 'go'

const INPUT_OPTIONS = [
  { label: 'JSON', value: 'json' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'Go Struct', value: 'go' },
]

const OUTPUT_OPTIONS: Record<InputFormat, { label: string; value: OutputFormat }[]> = {
  json: [
    { label: 'TS interface', value: 'ts-interface' },
    { label: 'TS type', value: 'ts-type' },
    { label: 'Go Struct', value: 'go' },
  ],
  ts: [{ label: 'Go Struct', value: 'go' }],
  go: [
    { label: 'TS interface', value: 'ts-interface' },
    { label: 'TS type', value: 'ts-type' },
  ],
}

const PLACEHOLDERS: Record<InputFormat, string> = {
  json: `{
  "id": 1,
  "name": "Alice",
  "email": null,
  "address": {
    "city": "Shanghai",
    "zip": "200000"
  },
  "tags": ["go", "ts"]
}`,
  ts: `export interface User {
  id: number
  name: string
  email: string | null
  createdAt?: Date
  tags: string[]
}`,
  go: `type User struct {
\tID        int64     \`json:"id"\`
\tName      string    \`json:"name"\`
\tEmail     *string   \`json:"email"\`
\tCreatedAt time.Time \`json:"created_at"\`
\tTags      []string  \`json:"tags"\`
}`,
}

function runConvert(
  input: string,
  inputFmt: InputFormat,
  outputFmt: OutputFormat,
  nested: boolean,
): ConvertResult {
  if (!input.trim()) return { code: '' }
  switch (inputFmt) {
    case 'json':
      if (outputFmt === 'go') return jsonToGo(input, nested)
      return jsonToTs(input, outputFmt === 'ts-type' ? 'type' : 'interface', nested)
    case 'ts':
      return tsToGo(input)
    case 'go':
      return goToTs(input, outputFmt === 'ts-type' ? 'type' : 'interface')
  }
}

export default function TypeConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [inputFormat, setInputFormat] = useState<InputFormat>('json')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('ts-interface')
  const [nested, setNested] = useState(false)
  const { message } = App.useApp()

  const inputFormatRef = useRef(inputFormat)
  inputFormatRef.current = inputFormat
  const outputFormatRef = useRef(outputFormat)
  outputFormatRef.current = outputFormat
  const nestedRef = useRef(nested)
  nestedRef.current = nested

  const applyResult = (result: ConvertResult) => {
    if (result.error) {
      message.error(result.error)
      setOutput('')
    } else {
      setOutput(result.code)
    }
  }

  const { run: debouncedConvert } = useDebounceFn(
    (value: string) => {
      if (!value.trim()) { setOutput(''); return }
      applyResult(runConvert(value, inputFormatRef.current, outputFormatRef.current, nestedRef.current))
    },
    { wait: 400 },
  )

  useEffect(() => { debouncedConvert(input) }, [input]) // eslint-disable-line

  useEffect(() => {
    if (input.trim()) applyResult(runConvert(input, inputFormat, outputFormat, nestedRef.current))
  }, [outputFormat]) // eslint-disable-line

  useEffect(() => {
    if (input.trim()) applyResult(runConvert(input, inputFormatRef.current, outputFormatRef.current, nested))
  }, [nested]) // eslint-disable-line

  const handleInputFormatChange = (newFmt: InputFormat) => {
    const available = OUTPUT_OPTIONS[newFmt]
    const newOutputFmt = available.find(o => o.value === outputFormat) ? outputFormat : available[0].value
    setInputFormat(newFmt)
    setOutputFormat(newOutputFmt)
    if (input.trim()) applyResult(runConvert(input, newFmt, newOutputFmt, nestedRef.current))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => message.success('已复制到剪贴板'))
  }

  return (
    <div className="w-full max-w-[1600px]">
      <div className="text-center mb-6">
        <Title level={2} className="!mb-1">类型转换工具</Title>
        <Text className="text-gray-500">JSON / TypeScript / Go Struct 互转</Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          title="输入"
          extra={
            <Segmented
              size="small"
              value={inputFormat}
              onChange={v => handleInputFormatChange(v as InputFormat)}
              options={INPUT_OPTIONS}
            />
          }
        >
          <TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={PLACEHOLDERS[inputFormat]}
            autoSize={{ minRows: 18, maxRows: 30 }}
            wrap="off"
            style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 13, overflowX: 'auto' }}
          />
        </Card>

        <Card
          title="输出"
          extra={
            <Space>
              {inputFormat === 'json' && (
                <Space size={4}>
                  <Switch size="small" checked={nested} onChange={setNested} />
                  <Text className="text-gray-400 text-xs">嵌套</Text>
                </Space>
              )}
              <Segmented
                size="small"
                value={outputFormat}
                onChange={v => setOutputFormat(v as OutputFormat)}
                options={OUTPUT_OPTIONS[inputFormat]}
              />
              {output && (
                <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>
                  复制
                </Button>
              )}
            </Space>
          }
        >
          <TextArea
            value={output}
            readOnly
            placeholder="转换结果将显示在这里…"
            autoSize={{ minRows: 18, maxRows: 30 }}
            wrap="off"
            style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 13, overflowX: 'auto' }}
          />
        </Card>
      </div>
    </div>
  )
}
