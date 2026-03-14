import { Card, Typography } from 'antd'
import { ToolOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

const tools = [
  { title: 'JSON 格式化', description: '格式化、压缩、校验 JSON 数据', href: '/json' },
  { title: 'Base64 编解码', description: 'Base64 编码与解码转换', href: '/base64' },
  { title: 'URL 编解码', description: 'URL 编码与解码转换', href: '/url-encode' },
  { title: '时间戳转换', description: 'Unix 时间戳与日期格式互转', href: '/timestamp' },
]

export default function Home() {
  return (
    <div className="w-full max-w-3xl">
      <div className="text-center mb-10">
        <Title>
          <ToolOutlined className="mr-2" />
          JS Toolbox
        </Title>
        <Paragraph className="text-gray-500 text-base">
          一个面向开发者的在线工具集合
        </Paragraph>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Card
            key={tool.href}
            hoverable
            className="cursor-pointer"
            onClick={() => (window.location.href = tool.href)}
          >
            <Title level={5} className="mb-1">
              {tool.title}
            </Title>
            <Paragraph className="text-gray-500 mb-0">{tool.description}</Paragraph>
          </Card>
        ))}
      </div>
    </div>
  )
}
