import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Input, message, Space } from "antd";
import Text from "antd/lib/typography/Text";
import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { propertyType } from "../../types";

type CreatePropertyProps = {
  url: string,
  items: propertyType[],
  updateItems: Function
}

const CreateProperty = ({ url, items, updateItems }: CreatePropertyProps) => {

  const [newItem, setNewItem] = useState<{ name: string }>();

  const fetchData = useFetch();

  const handleAdd = async () => {
    const response = await fetchData(url, "POST", newItem);
    if(response.error) message.error(response.error);
    else updateItems();
  }

  const handleDelete = async (id: number) => {
    const response = await fetchData(`${url}/${id}`, "DELETE");
    if(response.error) message.error(response.error);
    else updateItems();
  }

  return (

    <Space size="small" direction="vertical" style={{width: "100%"}}>
      {items.map((category, i) =>
        <div key={`${i}-${category.name}`} style={{width: "100%", display: "flex", justifyContent: "space-between"}}>
          <Text style={{overflowWrap: "anywhere"}}>{category.name}</Text>
          <MinusCircleOutlined
            style={{marginLeft: "1em"}}
            onClick={() => handleDelete(category._id)}
          />
        </div>
      )}

      <div style={{display: "inline-flex"}}>
        <Input placeholder="Entrer un nom." onChange={e => setNewItem({ name: e.target.value })} />
        <Button type="primary" onClick={() => newItem && handleAdd()}>Ajouter</Button>
      </div>

    </Space>
  )
}

export { CreateProperty }