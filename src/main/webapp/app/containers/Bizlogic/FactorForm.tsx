import * as React from 'react'
import * as label from 'assets/json/slideSettings/label.json';
const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const Select = require('antd/lib/select')
const Icon = require('antd/lib/icon')
const FormItem = Form.Item
const Option = Select.Option

interface IFactorFormProps {
    form: any,
    tableArr: any[]
}

export class FactorForm extends React.PureComponent<IFactorFormProps, {}>{

    public render() {
        const { form, tableArr } = this.props
        const { getFieldDecorator } = form
        const commonFormItemStyle = {
            labelCol: { span: 6 },
            wrapperCol: { span: 16 }
        }
        let nickMames = [];
        tableArr.map(item => {
            let tmp = item.tableName.split('_');
            let nickName = '';
            tmp.length > 1 ? tmp.map(item => nickName += item.substring(0, 1)) + tmp[tmp.length - 1] : nickName = item.tableName;
            tmp.length > 1 ? nickName = nickName + tmp[tmp.length - 1] : '';
            nickMames.push(`${nickName}`);
        })
        return (
            <Form>

                {
                    tableArr.length > 0 ? tableArr.map((item, index) =>
                        <Row key={index}>
                            <Col span={24}>
                                <FormItem label={index === 0 ? `主表${nickMames[index]}` : `副表${nickMames[index]}`} {...commonFormItemStyle}>
                                    {getFieldDecorator(index === 0 ? 'mainTable' : 'sideTable', {
                                        rules: [{ required: true }],
                                        initialValue: ''
                                    })(
                                        <Select>
                                            {item.childrenProp.map((children, key) => <Option key={key} value={`${nickMames[index]}.${children}`}>{children}</Option>)}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                    ) : ''
                }

                {/* <Row>
                    <Col span={24}>
                        <FormItem label={`主表${nickMames[0]}`} {...commonFormItemStyle}>
                            {getFieldDecorator('mainTable', {
                                rules: [{ required: true, message: '请选择表的关联字段' }],
                                initialValue: ``
                            })(
                                <Select>
                                    {tableArr.length > 1 ? tableArr[0].childrenProp.map(item => <Option value={`${nickMames[0]}.${item}`}>{item}</Option>) : ''}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <FormItem label={`副表${nickMames[1]}`} {...commonFormItemStyle}>
                            {getFieldDecorator('sideTable', {
                                rules: [{ required: true, message: '请选择表的关联字段' }],
                                initialValue: ``
                            })(
                                <Select>
                                    {tableArr.length > 1 ? tableArr[1].childrenProp.map(item => <Option value={`${nickMames[1]}.${item}`}>{item}</Option>) : ''}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row> */}
            </Form>
        )
    }
}



export default Form.create()(FactorForm)