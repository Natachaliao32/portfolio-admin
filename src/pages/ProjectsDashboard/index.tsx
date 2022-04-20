import { Button, Card, Col, Empty, message, Modal, Row } from "antd"
import Title from "antd/lib/typography/Title";
import { Link } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { projectType } from "../../types"

type ProjectsDashboardProps = {
  url: string,
  projects: projectType[],
  updateProjects: Function,
}

const ProjectsDashboard = ({ url, projects, updateProjects }: ProjectsDashboardProps) => {

  const { Meta } = Card;
  const [modal, contextHolder] = Modal.useModal();
  const fetchData = useFetch();

  const onButtonClick = (e: React.MouseEvent, uid: string) => {
    e.stopPropagation();
    e.preventDefault();
    const config = {
      title: 'Voulez-vous supprimer le projet ?',
      onOk: async () => {
        // remove project from database
        const response = await fetchData(`${url}/projects/${uid}`, "DELETE");
        if (response.error) {
          message.error("Project could not be deleted.");
          console.log(response.error);
        }
        else {
          message.success("Project has been successfully deleted.");
          console.log("Project has been successfully deleted.");
        }
        // update parent 
        updateProjects();
      },
    }
    modal.confirm(config);
  }

  return (
    <div className="page">
      <Title className="page-title">Projets</Title>
      <Row justify="center" >
        {projects.length === 0 &&
        <Empty
          description={<span>Aucun projet pour l'instant.</span>}
        >
          <Button type="primary">
            <Link to="/create-project">Créer un projet</Link>
          </Button>
        </Empty>}
      </Row>
      <Row gutter={24}>
        {projects.map((project, i) =>
          <Col span={6} key={`project-${i}`}>
            <Link to={`/projects/${project._id}`}>
              <Card
                hoverable
                style={{ width: '100%' }}
                cover={<img alt="example" src={`${url}/files/${project.cover}`} height={150}/ >}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <Meta title={project.name} description="" style={{ textAlign: "center" }} />
                  <Button type="primary" htmlType="button" onClick={e => onButtonClick(e, project._id!)}>Supprimer</Button>
                </div>
              </Card>
            </Link>
          </Col>
        )}
      </Row>
      {contextHolder}
    </div>
  )
}

export { ProjectsDashboard }