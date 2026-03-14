import { useEffect, useState } from 'react'
import { App, Button, Card, Input, Typography } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { useDebounceFn } from 'ahooks'
import { sqlToGorm } from './converter'

const { TextArea } = Input
const { Title, Text } = Typography

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
  const { message } = App.useApp()

  const { run: convert } = useDebounceFn(
    (value: string) => {
      if (!value.trim()) {
        setOutput('')
        return
      }
      const result = sqlToGorm(value)
      if (result.error) {
        message.error(result.error)
        setOutput('')
      } else {
        setOutput(result.code)
      }
    },
    { wait: 400 },
  )

  useEffect(() => {
    convert(sql)
  }, [sql])

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      message.success('已复制到剪贴板')
    })
  }

  return (
    <div className="w-full max-w-[1600px]">
      <div className="text-center mb-6">
        <Title level={2} className="!mb-1">
          SQL 转 GORM Model
        </Title>
        <Text className="text-gray-500">
          将 MySQL / PostgreSQL 建表语句转换为 Go GORM Model 定义
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
          title="GORM Model"
          extra={
            output && (
              <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>
                复制
              </Button>
            )
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
