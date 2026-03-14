import { useState } from 'react'
import { App, Button, Card, Checkbox, Col, Input, InputNumber, Row, Space, Typography } from 'antd'
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
}

const OPTIONS = [
  { key: 'uppercase', label: '大写字母 (A-Z)' },
  { key: 'lowercase', label: '小写字母 (a-z)' },
  { key: 'digits', label: '数字 (0-9)' },
  { key: 'symbols', label: '特殊符号 (!@#$…)' },
] as const

type CharsetKey = keyof typeof CHARSETS

function generate(length: number, enabled: Set<CharsetKey>): string {
  if (enabled.size === 0) return ''
  const pool = [...enabled].map(k => CHARSETS[k]).join('')
  let result = ''

  // Guarantee at least one char from each selected charset
  const required = [...enabled].map(k => {
    const s = CHARSETS[k]
    return s[Math.floor(Math.random() * s.length)]
  })

  // Fill the rest randomly from the full pool
  for (let i = required.length; i < length; i++) {
    required.push(pool[Math.floor(Math.random() * pool.length)])
  }

  // Fisher–Yates shuffle
  for (let i = required.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[required[i], required[j]] = [required[j], required[i]]
  }

  result = required.slice(0, length).join('')
  return result
}

const DEFAULT_ENABLED = new Set<CharsetKey>(['uppercase', 'lowercase', 'digits'])

const PRESET_LENGTHS = [8, 16, 32, 64, 128, 256]

export default function RandomString() {
  const [length, setLength] = useState(32)
  const [enabled, setEnabled] = useState<Set<CharsetKey>>(DEFAULT_ENABLED)
  const [output, setOutput] = useState(() => generate(32, DEFAULT_ENABLED))
  const { message } = App.useApp()

  const toggle = (key: CharsetKey, checked: boolean) => {
    const next = new Set(enabled)
    if (checked) {
      next.add(key)
    } else {
      if (next.size === 1) {
        message.warning('至少保留一种字符类型')
        return
      }
      next.delete(key)
    }
    setEnabled(next)
    setOutput(generate(length, next))
  }

  const handleGenerate = () => {
    setOutput(generate(length, enabled))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      message.success('已复制到剪贴板')
    })
  }

  return (
    <div className="w-full max-w-xl">
      <div className="text-center mb-6">
        <Title level={2} className="!mb-1">
          随机字符串生成
        </Title>
        <Text className="text-gray-500">按需配置字符范围，快速生成随机字符串</Text>
      </div>

      <Card>
        <Space direction="vertical" size="large" className="w-full">
          {/* Length */}
          <div>
            <Text strong className="block mb-2">
              字符串长度
            </Text>
            <Space className="w-full">
              <InputNumber
                min={1}
                max={1024}
                value={length}
                onChange={v => {
                  const val = v ?? 1
                  setLength(val)
                  setOutput(generate(val, enabled))
                }}
                className="w-full"
              />
              {PRESET_LENGTHS.map(n => (
                <Button
                  key={n}
                  type={length === n ? 'primary' : 'default'}
                  onClick={() => {
                    setLength(n)
                    setOutput(generate(n, enabled))
                  }}
                >
                  {n}
                </Button>
              ))}
            </Space>
          </div>

          {/* Charset options */}
          <div>
            <Text strong className="block mb-2">
              字符范围
            </Text>
            <Row gutter={[0, 8]}>
              {OPTIONS.map(opt => (
                <Col span={12} key={opt.key}>
                  <Checkbox
                    checked={enabled.has(opt.key)}
                    onChange={e => toggle(opt.key, e.target.checked)}
                  >
                    {opt.label}
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </div>

          {/* Output */}
          <div>
            <Text strong className="block mb-2">
              生成结果
            </Text>
            <Input.TextArea
              value={output}
              readOnly
              autoSize={{ minRows: 3, maxRows: 6 }}
              style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 13 }}
            />
          </div>

          {/* Actions */}
          <Space>
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleGenerate}>
              重新生成
            </Button>
            <Button icon={<CopyOutlined />} onClick={handleCopy} disabled={!output}>
              复制
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  )
}
