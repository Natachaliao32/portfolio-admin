import { Row, Col, Typography, Image, Button, Divider, Space } from "antd"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { projectType, propertyType } from "../../types"
import { CreateProject } from "../CreateProject"

type ProjectPageProps = {
  projects: projectType[],
  url: string,
  categories: propertyType[],
  tools: propertyType[],
  updateCategories: Function,
  updateTools: Function,
  updateProjects: Function,
}

const ProjectPage = ({ projects, url, categories, tools, updateCategories, updateTools, updateProjects }: ProjectPageProps) => {

  const [editing, setEditing] = useState(false);
  const { Title } = Typography;
  const { id } = useParams();
  const project = projects.filter(project => project._id === id)[0];

  console.log(project);


  return (
    <div className="page form-page">

      {project && (editing ?
        <CreateProject
          data={project}
          url={url}
          categories={categories}
          tools={tools}
          updateCategories={updateCategories}
          updateTools={updateTools}
          updateProjects={updateProjects}
          setEditing={setEditing}
        /> :
        <>
          <Title className="page-title">{project.name}</Title>
          <ProjectInfo url={url} project={project} goToEditMode={setEditing} />
        </>)
      }
    </div>

  )
}

type ProjectInfoProps = {
  url: string,
  project: projectType,
  goToEditMode: Function,
}

const ProjectInfo = ({ url, project, goToEditMode }: ProjectInfoProps) => {

  console.log(project);


  const [labelSpan, wrapperSpan] = [8, 16];

  const { Text } = Typography;
  return (
    <>
      <Row>
        <Col span={labelSpan}>
          <Text>Nom du projet</Text>
        </Col>
        <Col span={wrapperSpan}>
          <Text>{project.name}</Text>
        </Col>
      </Row>

      <Divider />

      <Row>
        <Col span={labelSpan}>
          <Text>Date</Text>
        </Col>
        <Col span={wrapperSpan}>
          <Text>{project.date}</Text>
        </Col>
      </Row>

      <Divider />

      <Row>
        <Col span={labelSpan}>
          <Text>Catégories</Text>
        </Col>
        <Col span={wrapperSpan}>
          <Space size="middle" wrap>
            {project.categories.map((category, i) => <Text key={`category-${i}`}>{category}</Text>)}
          </Space>
        </Col>
      </Row>

      <Divider />

      <Row>
        <Col span={labelSpan}>
          <Text>Image de couverture</Text>
        </Col>
        <Col span={wrapperSpan}>
          <Image
            width={150} height={150}
            style={{objectFit: "cover"}}
            src={`${url}/files/${project.cover}`}
          />
        </Col>
      </Row>

      <Divider />

      <Row>
        <Col span={labelSpan}>
          <Text>Collaborateurs</Text>
        </Col>
        <Col span={wrapperSpan}>
          <Space size="middle" wrap>
            {project.contributors.map(contributor => <Text>{contributor}</Text>)}
          </Space>
        </Col>
      </Row>

      <Divider />

      <Row>
        <Col span={labelSpan}>
          <Text>Liens</Text>
        </Col>
        <Col span={wrapperSpan}>
          <Space size="middle" wrap>
            {project.links.map(link => <Text>{link}</Text>)}
          </Space>
        </Col>
      </Row>

      <Divider />

      <Row>
        <Col span={labelSpan}>
          <Text>Outils</Text>
        </Col>
        <Col span={wrapperSpan}>
          <Space size="middle" wrap>
            {project.tools.map(tool => <Text>{tool}</Text>)}
          </Space>
        </Col>
      </Row>

      <Divider />

      <Row>
        <Col span={labelSpan}>
          <Text>Description</Text>
        </Col>
        <Col span={wrapperSpan}>
          <Text>{project.description}</Text>
        </Col>
      </Row>

      <Divider />

      <Row>
        <Col span={labelSpan}>
          <Text>Fichiers</Text>
        </Col>
        <Col span={wrapperSpan}>
          <Image.PreviewGroup>
            <Space size="large" wrap>
              {project.files.filter(file => file.media === "image").map((file, i) =>
                <Image
                  key={`picture-${i}`}
                  style={{objectFit: "cover"}}
                  width={150} height={150}
                  src={file.external ? file.path : `${url}/files/${file.path}`}
                />)}
              {project.files.filter(file => file.media === "video").map((file, i) =>
                <iframe 
                  height="150" 
                  src={file.path} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                  X-Frame-Options
                />)}
            </Space>
          </Image.PreviewGroup>
        </Col>

      </Row>

      <Divider />

      <Row>
        <Col span={labelSpan}></Col>
        <Col span={wrapperSpan}>
          <Button htmlType="button" type="primary" onClick={() => goToEditMode(true)}>Modifier</Button>
        </Col>
      </Row>

    </>
  )
}

export { ProjectPage }