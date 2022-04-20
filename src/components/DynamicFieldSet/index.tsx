import { Form, Input, Button } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import "./DynamicFieldSet.css";

type DynamicFieldSetProps = {
  name: string,
  placeholder: string,
}

const DynamicFieldSet = ({ name, placeholder }: DynamicFieldSetProps) => {
  
  return (
      <Form.List name={name}>
        {(fields, { add, remove }, { errors }) => (
          <>
            <Form.Item
              wrapperCol={{span: 24}}
              required={false}
              noStyle
            >
              {fields.map((field, index) => (
                <Form.Item 
                  key={`${name}-${field.key}`}     
                >
                  <Form.Item
                    name={index}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                      },
                    ]}
                    noStyle               
                  >
                    <Input 
                      placeholder={placeholder}
                    />
                  </Form.Item>

                  <MinusCircleOutlined
                    className="dynamic-delete-button"
                    onClick={() => remove(field.name)}
                  />

                </Form.Item>
              ))}
              <Form.Item noStyle>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  style={{ width: '100%' }} 
                >
                  Ajouter un champ
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </Form.Item>
          </>
        )}
      </Form.List>
  );
};

export { DynamicFieldSet }