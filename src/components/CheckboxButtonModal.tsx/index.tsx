import { useState } from 'react';
import { Modal, Button, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useFetch } from '../../hooks/useFetch';

type CheckboxButtonModalProps = {
  url: string,
  title: string,
  update: Function,
}
const CheckboxButtonModal = ({ url, title, update } : CheckboxButtonModalProps) => {
  const fetchData = useFetch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [value, setValue] = useState("");

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    setIsModalVisible(false);
    const response = await fetchData(url, "POST", {name: value});
    if(response.error) message.error(response.error);
    else update();
    console.log("update categories or tools");
    
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Button onClick={showModal} icon={<PlusOutlined style={{width: "80%"}}/>} style={{width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "center"}} />
      <Modal title={title} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Input onChange={e => setValue(e.target.value)}/>
      </Modal>
    </>
  );
};

export {CheckboxButtonModal};