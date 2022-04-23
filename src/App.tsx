import { useEffect, useState } from 'react';
import './App.css';
import { useFetch } from './hooks/useFetch';
import { projectType, propertyType } from './types';
import { CreateProject } from './pages/CreateProject';
import { PropertiesPage } from './pages/PropertiesPage';
import { ProjectsDashboard } from './pages/ProjectsDashboard';

import { Layout, message } from 'antd';
import { SideMenu } from './components/SideMenu';
import { Routes, Route } from 'react-router-dom';
import { ProjectPage } from './pages/ProjectPage';
const { Content, Sider } = Layout;

function App() {

  const [categories, setCategories] = useState<propertyType[]>([]);
  const [tools, setTools] = useState<propertyType[]>([]);
  const [projects, setProjects] = useState<projectType[]>([]);

  // const url = "http://localhost:3000";
  const url = "https://demo-portfolio-api.herokuapp.com";
  const fetchData = useFetch();

  const update = async (name: string, callback: Function) => {
    const data = await fetchData(`${url}/${name}`, "GET");
    if (data.error) message.error(data.error);
    else callback(data);
  }

  useEffect(() => {
    update("categories", setCategories);
    update("tools", setTools);
    update("projects", setProjects);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) 


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <SideMenu />
      </Sider>
      <Layout>
        <Content style={{ margin: '32px 64px' }}>
          <Routes>
            <Route path="/" element={
              <ProjectsDashboard url={url} projects={projects}
                updateProjects={update.bind(null, "projects", setProjects)}
              />
            } />
            <Route path="/create-project" element={
              <CreateProject
                url={url}
                categories={categories}
                tools={tools}
                updateCategories={update.bind(null, "categories", setCategories)}
                updateTools={update.bind(null, "tools", setTools)}
                updateProjects={update.bind(null, "projects", setProjects)}
                redirect="/"
              />
            } />
            <Route path='/properties' element={
              <PropertiesPage
                categories={categories}
                tools={tools}
                updateCategories={update.bind(null, "categories", setCategories)}
                updateTools={update.bind(null, "tools", setTools)}
              />
            } />
            <Route path="/projects/:id" element={
              <ProjectPage
                projects={projects}
                url={url}
                categories={categories}
                tools={tools}
                updateCategories={update.bind(null, "categories", setCategories)}
                updateTools={update.bind(null, "tools", setTools)}
                updateProjects={update.bind(null, "projects", setProjects)}
              />
            } />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
