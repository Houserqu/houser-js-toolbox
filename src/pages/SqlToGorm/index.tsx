import { useEffect, useRef, useState } from 'react'
import { App, Button, Card, Input, Segmented, Space, Typography } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { useDebounceFn } from 'ahooks'
import { sqlToGorm, type ConvertResult } from './converter'
import { sqlToTs } from './tsConverter'

const { TextArea } = Input
const { Title, Text } = Typography

type OutputFormat = 'gorm' | 'ts-type' | 'ts-interface'

const FORMAT_OPTIONS = [
  { label: 'GORM Model', value: 'gorm' },
  { label: 'TS type', value: 'ts-type' },
  { label: 'TS interface', value: 'ts-interface' },
]

function runConvert(sql: string, format: OutputFormat): ConvertResult {
  if (format === 'gorm') return sqlToGorm(sql)
  return sqlToTs(sql, format === 'ts-type' ? 'type' : 'interface')
}

const PLACEHOLDER = `-- 示例（MySQL）
CREATE TABLE \`account_poi\` (
  \`id\`         bigint(20) NOT NULL AUTO_INCREMENT,
  \`account_id\` bigint(20) NOT NULL,
  \`name\`       varchar(255) DEFAULT '' COMMENT '名称',
  \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`deleted_at\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

export default function SqlToGorm() {
  const [sql, setSql] = useState('')
  const [output, setOutput] = useState('')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('gorm')
  const outputFormatRef = useRef<OutputFormat>(outputFormat)
  outputFormatRef.current = outputFormat
  const { message } = App.useApp()

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
      if (!value.trim()) {
        setOutput('')
        return
      }
      applyResult(runConvert(value, outputFormatRef.current))
    },
    { wait: 400 },
  )

  // SQL 变化时防抖转换
  useEffect(() => {
    debouncedConvert(sql)
  }, [sql]) // eslint-disable-line react-hooks/exhaustive-deps

  // 切换格式时立即重新转换
  useEffect(() => {
    if (sql.trim()) applyResult(runConvert(sql, outputFormat))
  }, [outputFormat]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      message.success('已复制到剪贴板')
    })
  }

  return (
    <div className="w-full max-w-[1600px]">
      <div className="text-center mb-6">
        <Title level={2} className="!mb-1">
          SQL 转换工具
        </Title>
        <Text className="text-gray-500">
          将 MySQL / PostgreSQL 建表语句转换为 GORM Model 或 TypeScript 类型定义
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          title="SQL 输入"
          extra={<Text className="text-gray-400 text-xs">支持 MySQL / PostgreSQL</Text>}
        >
          <TextArea
            value={sql}
            onChange={e => setSql(e.target.value)}
            placeholder={PLACEHOLDER}
            autoSize={{ minRows: 18, maxRows: 30 }}
            wrap="off"
            style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 13, overflowX: 'auto' }}
          />
        </Card>

        <Card
          title="输出"
          extra={
            <Space>
              <Segmented
                size="small"
                value={outputFormat}
                onChange={v => setOutputFormat(v as OutputFormat)}
                options={FORMAT_OPTIONS}
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
