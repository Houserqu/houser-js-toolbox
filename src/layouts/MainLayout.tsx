import { Layout } from "antd";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

export default function MainLayout() {
  return (
    <Layout className="h-full bg-gray-100">
      <Content className="h-screen flex flex-1 flex-col items-center justify-center py-12 px-4">
        <Outlet />
      </Content>
    </Layout>
  );
}
