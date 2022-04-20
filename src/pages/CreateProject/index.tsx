import { useNavigate } from "react-router-dom";

import { useFetch } from "../../hooks/useFetch";
import { fileType, projectType, propertyType } from "../../types";
import './CreateProject.css';

import { Form, Input, Button, Checkbox, Row, Col, Upload, message, Space, Modal } from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";
import { DynamicFieldSet } from "../../components/DynamicFieldSet";
import Title from "antd/lib/typography/Title";
import { UploadFile, UploadFileStatus } from "antd/lib/upload/interface";
import { CheckboxButtonModal } from "../../components/CheckboxButtonModal.tsx";

type CreateProjectProps = {
  data?: projectType,
  url: string,
  categories: propertyType[],
  tools: propertyType[],
  updateCategories: Function,
  updateTools: Function,
  updateProjects: Function,
  redirect?: string,
  setEditing?: Function,
}

const CreateProject = ({ data, url, categories, tools, updateCategories, updateTools, updateProjects, redirect, setEditing }: CreateProjectProps) => {

  console.log(data);
  
  const navigate = useNavigate();
  const fetchData = useFetch();
  const title = data ? data.name : "Créer un projet";
  const handleRedirect = () => {
    if(redirect) navigate(redirect);
    if(setEditing) setEditing(false);
  }
  const [modal, contextHolder] = Modal.useModal();
  const cancelConfig = {
    title: 'Êtes-vous sûr ?',
    onOk: () => {
      handleRedirect();
    },
  }

  const UploadFileFormat = (path: string, uid: string) => {
    console.log(path);
    
    const pathArray = path.split('/');
    return {
      uid,
      name: pathArray[pathArray.length - 1],
      status: "done" as UploadFileStatus,
      url: `${url}/files/${path}`,
      path,
    }
  }

  const initialValues = data ? {
    name: data.name,
    date: data.date,
    categories: data.categories,
    cover: data.cover ? [UploadFileFormat(data.cover, "1")] : undefined,
    contributors: data.contributors,
    links: data.links,
    tools: data.tools,
    description: data.description,
    'uploaded-files': data.files.filter(file => !file.external).map((file, i) => UploadFileFormat(file.path, i.toString())),
    'external-files': data.files.filter(file => file.external).map(file => file.path),
  } : undefined;

  console.log("initialValues", initialValues);

  const getFilesToRemove = (prevFiles: Array<any>, newFiles: Array<any>) => {
    let filesToRemove: Array<fileType> = [];
    if (!data) return filesToRemove;

    const uploadFilesToRemove = prevFiles
      .filter(file => !newFiles.map(file => file.uid).includes(file.uid));

    filesToRemove = data.files.filter(file => !file.external).filter(file => {
      const pathArray = file.path.split('/');
      const name = pathArray[pathArray.length - 1];
      return uploadFilesToRemove.map(file => file.name).includes(name);
    })

    return filesToRemove;
  }

  const removeFiles = async (filesPath: Array<string>) => {
    const response = await fetchData(`${url}/files`, "DELETE", { filesPath });
    if (response.error) {
      console.log(response.error);
      message.error(response.error);
    }
    else console.log(response);
  }

  const onFinish = async (project: any) => {

    project.cover = project.cover.file ? project.cover.file : project.cover;

    project['uploaded-files'] = project['uploaded-files']?.fileList ? project['uploaded-files'].fileList : project['uploaded-files'];

    console.log("project: ", project);

    // Remove files among already uploaded files
    let filesToKeep: fileType[] = [];

    if (initialValues) {
      let filesToRemove = getFilesToRemove(initialValues["uploaded-files"], project['uploaded-files']).map(file => file.path);
      // previous cover should be removed if another cover uploaded
      if (project.cover.originFileObj && (data && data.cover)) filesToRemove.push(data.cover);
      console.log("filesToRemove: ", filesToRemove);
      removeFiles(filesToRemove);

      // Remove those files from project object
      project['uploaded-files'] = project['uploaded-files'].filter((file: any) => !filesToRemove.includes(file.path));

      // Define uploaded files to keep
      filesToKeep = data!.files.filter(file => !file.external).filter(file => !filesToRemove.includes(file.path));
    }

    console.log("filesToKeep: ", filesToKeep);

    // Format project

    const {'external-files': a, 'uploaded-files': b, ...projectProps} = project;
    const cpy = { ...projectProps, files: [] };

    const formData = new FormData();

    // Handle cover
    if(data) cpy.cover = data.cover;
    if(project.cover.originFileObj) {
      formData.append('coverToUpload', project.cover.originFileObj);
      cpy.cover = undefined;
    }
    // Handle files
    cpy.files = data ? filesToKeep : []; 
    if (project['uploaded-files']) {
      const filesToAdd = project['uploaded-files'].filter((file: UploadFile) => file.originFileObj);
      console.log("filesToAdd: ", filesToAdd);
      filesToAdd.forEach((file: UploadFile) => formData.append("assetsToUpload", file.originFileObj!));
    }
    // Add external links to files property
    if (project['external-files']) cpy.files.push(...project['external-files'].map((link: string) => {
      return { media: "video", path: link, external: true }
    }));
    // Delete undefined values
    Object.keys(cpy).forEach(key => {
      if (!cpy[key]) delete cpy[key];
    })
    // Append properties of cpy to formData
    Object.entries(cpy).forEach(([key, value]) => {
      const valueToAppend = value as any;
      switch (key) {
        case "name":
        case "date":
        case "cover":
        case "description":
          formData.append(key, valueToAppend);
          break;
        case "categories":
        case "contributors":
        case"links":
        case "tools":
          valueToAppend.forEach((elt: string) => formData.append(key, elt));
          break;
        case "files":
          valueToAppend.forEach((elt: object) => formData.append(key, JSON.stringify(elt)));
          break;
        default:
          break;
      }
    })
    formData.append("project", JSON.stringify(cpy));

    console.log("data to send: ", cpy);

    // Send project to server
    let result;
    if (data) {
      result = await fetchData(`${url}/projects/${data._id}`, "PATCH", formData);
      if (result.error) {
        message.error("Project could not be updated");
        console.log(result.error);
      }
      else {
        message.success("Project successfully modified.");
        console.log("Project successfully modified.");
      }
    } else {
      result = await fetchData(`${url}/projects`, "POST", formData);
      if (result.error) {
        message.error("Project could not be created");
        console.log(result.error);
      }
      else {
        message.success("Project successfully created.");
        console.log("Project successfully modified.");
      }
    }
    console.log("result: ", result);
    updateProjects();
    handleRedirect();
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error('Failed:', errorInfo)
  }

  const allowTypes = (file: File, types: string[]) => {

    let isOfAllowedType = false;

    for (let i = 0; i < types.length; i++) {
      const typesSplit = types[i].split('/');
      isOfAllowedType = typesSplit[1] === '*' && file.type.includes(typesSplit[0]);
      if (isOfAllowedType) break;
    }

    if (!isOfAllowedType) {
      isOfAllowedType = types.includes(file.type);
    }

    if (!isOfAllowedType) message.error(`${file.name} is not an image file`)
    return isOfAllowedType || Upload.LIST_IGNORE;
  }


  return (
    <div className="page form-page">

      {contextHolder}

      <Title className="page-title">{title}</Title>

      <Form initialValues={initialValues} onFinish={onFinish} onFinishFailed={onFinishFailed} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>

        <Form.Item name="name" label="Nom du projet" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="date" label="Date" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="categories" label="Catégories" rules={[{ required: true }]}>
          <Checkbox.Group style={{ width: '100%' }}>
            <Row>
              {categories.map((category, i) =>
                <Col span={8} key={`category-${i}`}>
                  <Checkbox value={category.name} style={{ overflowWrap: 'anywhere' }}>{category.name}</Checkbox>
                </Col>
              )}
              <CheckboxButtonModal url={`${url}/categories`} title="Ajouter une catégorie" update={updateCategories} />
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item name="cover" label="Image de couverture" rules={[{ required: true }]} preserve={false}>
          <Upload
            maxCount={1}
            accept="image/*"
            action={`${url}/files/dummy`}
            listType="picture-card"
            showUploadList={{ showPreviewIcon: false, showRemoveIcon: false }}
            defaultFileList={initialValues?.cover}
            beforeUpload={file => {console.log(file); allowTypes(file, ["image/*"])}}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Importer</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item name="contributors" label="Collaborateurs" >
          <DynamicFieldSet name="contributors" placeholder="Entrer le prénom et le nom du collaborateur." />
        </Form.Item>

        <Form.Item name="links" label="Liens" >
          <DynamicFieldSet name="links" placeholder="Entrer un lien." />
        </Form.Item>

        <Form.Item name="tools" label="Outils" rules={[{ required: true }]}>
          <Checkbox.Group style={{ width: '100%' }}>
            <Row>
              {tools.map((tool, i) =>
                <Col span={8} key={`tool-${i}`}>
                  <Checkbox value={tool.name}>{tool.name}</Checkbox>
                </Col>
              )}
              <CheckboxButtonModal url={`${url}/tools`} title="Ajouter un outil" update={updateTools} />
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <TextArea rows={4} placeholder="Ecrire la description du projet." />
        </Form.Item>

        <Form.Item name="uploaded-files" label="Importer des images" >
          <Upload
            multiple={true}
            accept="image/*, video/*, audio/*"
            action={`${url}/files/dummy`}
            listType="picture-card"
            showUploadList={{ showPreviewIcon: false }}
            defaultFileList={initialValues?.["uploaded-files"]}
            beforeUpload={file => allowTypes(file, ["image/*", "video/*", "audio/*"])}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Importer</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item name="external-files" label="Lier des vidéos" >
          <DynamicFieldSet name="external-files" placeholder="Entrer un lien par exemple un lien youtube." />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 20 }}>
          <Space size="small" >
            <Button htmlType="button" onClick={() => modal.confirm(cancelConfig)}>Annuler</Button>
            <Button type="primary" htmlType="submit">Envoyer</Button>
          </Space>
        </Form.Item>

      </Form>
    </div>
  );
}

export { CreateProject }
