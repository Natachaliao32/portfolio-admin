import { useEffect, useState } from "react";

import { useFetch } from "../../hooks/useFetch";
import { fileType, projectType, propertyType } from "../../types";
import './CreateProject.css';

import { Form, Input, Button, Checkbox, Row, Col, Upload, message, Space, Modal } from 'antd';
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
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
}

const CreateProject = ({ data, url, categories, tools, updateCategories, updateTools }: CreateProjectProps) => {

  const UploadFileFormat = (path: string, uid: string) => {
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
    cover: [UploadFileFormat(data.cover, "1")],
    contributors: data.contributors,
    links: data.links,
    tools: data.tools,
    description: data.description,
    ['uploaded-files']: data.files.filter(file => !file.external).map((file, i) => UploadFileFormat(file.path, i.toString())),
    ['external-files']: data.files.filter(file => file.external).map(file => file.path),
  } : undefined;

  console.log("initialValues", initialValues);


  const fetchData = useFetch();

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

  const changeName = (name: string, names: string[], index: number): string => {
    let newName = `${name}_${index}`;

    if (!names.includes(newName)) {
      console.log('names: ', names);
      console.log('newName:', newName);
      return newName;
    }
    return changeName(name, names, index + 1);
  }

  const onFinish = async (project: any) => {

    project.cover = project.cover.file ? project.cover.file : project.cover;

    project['uploaded-files'] = project['uploaded-files']?.fileList ? project['uploaded-files'].fileList : project['uploaded-files'];

    // Change names if files have same names
    // project['uploaded-files'].forEach((file: UploadFile, index: number) => {
    //   console.log("ulpoaded-files: ", project["uploaded-files"].map((file: UploadFile) => file.name));
    //   console.log(index);

    //   if(index !== project["uploaded-files"].map((file: UploadFile) => file.name).indexOf(file.name)) {
    //     let allNames = project['uploaded-files'].map((file: UploadFile) => file.name.split('.')[0]);
    //     allNames.splice(index, 1);
    //     const nameArray = file.name.split('.');
    //     file.name = `${changeName(nameArray[0], allNames, 1)}.${nameArray[1]}`;
    //   }

    // });

    console.log("project: ", project);

    // Remove files among already uploaded files
    let filesToKeep: fileType[] = [];

    if (initialValues) {
      let filesToRemove = getFilesToRemove(initialValues["uploaded-files"], project['uploaded-files']).map(file => file.path);
      // previous cover should be removed if another cover uploaded
      if (project.cover.originFileObj) filesToRemove.push(data!.cover);
      console.log("filesToRemove: ", filesToRemove);
      removeFiles(filesToRemove);

      // Remove those files from project object
      project['uploaded-files'] = project['uploaded-files'].filter((file: any) => !filesToRemove.includes(file.path));

      // Define uploaded files to keep
      filesToKeep = data!.files.filter(file => !file.external).filter(file => !filesToRemove.includes(file.path));
    }

    console.log("filesToKeep: ", filesToKeep);

    // Add new files

    const formData = new FormData();

    if (project.cover.status !== "removed") formData.append("cover", project.cover.originFileObj);

    if (project['uploaded-files']) {
      const filesToAdd = project['uploaded-files'].filter((file: UploadFile) => file.originFileObj);
      console.log("filesToAdd: ", filesToAdd);
      filesToAdd.forEach((file: UploadFile) => formData.append("array", file.originFileObj!));
    }

    const cpy = { ...project, files: [] };
    cpy.cover = data ? data.cover : project.cover;
    cpy.files = data ? filesToKeep : [];

    if (!formData.entries().next().done) { // if formData not empty
      formData.append("projectName", project.name);
      if(data) formData.append("projectId", data._id!.toString());
      const uploadedFiles = await fetchData(`${url}/files/upload`, "POST", formData);

      console.log("uploadedFiles: ", uploadedFiles);

      cpy.cover = uploadedFiles.cover ? uploadedFiles.cover : cpy.cover;

      if (uploadedFiles.files) cpy.files.push(...uploadedFiles.files);
      if (project['external-files']) cpy.files.push(...project['external-files'].map((link: string) => {
        return { media: "video", path: link, external: true }
      }));
    }

    // Update project object and give it the correct form

    delete cpy['uploaded-files'];
    delete cpy['external-files'];
    Object.keys(cpy).forEach(key => {
      if (!cpy[key]) delete cpy[key];
    })

    console.log("data to send: ", cpy);

    // Add project

    let result;
    if (data) {
      result = await fetchData(`${url}/projects/${data._id}`, "PATCH", cpy);
      if (result.error) message.error("Erreur");
      else {
        message.success("Project successfully modified.");
        console.log("Project successfully modified.");
      }
    } else {
      result = await fetchData(`${url}/projects`, "POST", cpy);
      if (result.error) message.error("Erreur");
      else {
        message.success("Project successfully created.");
        console.log("Project successfully modified.");
      }
    }
    console.log("result: ", result);
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

  const beforeUploadFiles = (file: File, fileList: File[], types: string[]) => {
    const allowedFile = allowTypes(file, types);
    // Change names if files have same names
    fileList.forEach((file, index: number) => {
      console.log("ulpoaded-files: ", fileList.map(file => file.name));
      console.log(index);

      let newFile = file;
      if (index !== fileList.map(file => file.name).indexOf(file.name)) {
        let allNames = fileList.map(file => file.name.split('.')[0]);
        allNames.splice(index, 1);
        const nameArray = file.name.split('.');
        const name = `${changeName(nameArray[0], allNames, 1)}.${nameArray[1]}`;
        const {name: prevName, ...fileProps} = file;
        newFile = {name, ...fileProps};
      }
    });
  }

  const [form] = Form.useForm();

  return (
    <div className="page">

      <Title className="page-title">Créer un projet</Title>

      <Form form={form} initialValues={initialValues} onFinish={onFinish} onFinishFailed={onFinishFailed} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>

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

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>

      </Form>
    </div>
  );
}

export { CreateProject }