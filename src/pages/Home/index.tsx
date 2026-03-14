import { Card, Typography } from 'antd'
import { ToolOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

const tools = [
  { title: 'SQL 转 GORM Model', description: '将 MySQL / PostgreSQL 建表语句转换为 GORM Model 定义', href: '/sql-to-gorm' },
  { title: '随机字符串生成', description: '可配置字符范围，生成指定长度的随机字符串', href: '/random-string' },
]

export default function Home() {
  const navigate = useNavigate()

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
            onClick={() => navigate(tool.href)}
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
