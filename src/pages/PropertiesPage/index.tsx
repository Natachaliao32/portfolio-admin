import { Col, Row } from "antd";
import Title from "antd/lib/typography/Title";
import { CreateProperty } from "../../components/CreateProperty";
import { propertyType } from "../../types";

type PropertiesPageProps = {
    url: string,
    categories: propertyType[],
    tools: propertyType[],
    updateCategories: Function,
    updateTools: Function,
}

const PropertiesPage = ({ url, categories, tools, updateCategories, updateTools }: PropertiesPageProps) => {
    return (
        <div className="page">
            <Row gutter={40}>
                <Col span={12}>
                    <Title level={2}>Catégories</Title>
                    <CreateProperty url={`${url}/categories`} items={categories} updateItems={updateCategories} />
                </Col>
                <Col span={12}>
                    <Title level={2}>Outils</Title>
                    <CreateProperty url={`${url}/tools`} items={tools} updateItems={updateTools} />
                </Col>

            </Row>
        </div>
    );
}

export { PropertiesPage }