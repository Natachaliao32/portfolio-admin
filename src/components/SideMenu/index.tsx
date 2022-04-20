import { AppstoreOutlined, CheckSquareOutlined, PlusOutlined } from "@ant-design/icons"
import { Menu } from "antd";
import { Link } from "react-router-dom";

const SideMenu = () => {

  return (
    <Menu
      defaultSelectedKeys={['projects-dashboard']}
      theme="dark"
      mode="inline"
    >
      <Menu.Item key="projects-dashboard" icon={<AppstoreOutlined />}>
        <Link to="/">
          Projets
        </Link>
      </Menu.Item>
      <Menu.Item key="create-project" icon={<PlusOutlined />}>
        <Link to="/create-project">
          Nouveau
        </Link>
      </Menu.Item>
      <Menu.Item key="constants" icon={<CheckSquareOutlined />}>
        <Link to="/properties">
          Catégories & Outils
        </Link>
      </Menu.Item>
    </Menu>
  )
}

export { SideMenu }