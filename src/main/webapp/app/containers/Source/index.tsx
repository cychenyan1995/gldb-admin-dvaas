/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'

import { compose } from 'redux'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import Container from '../../components/Container'
import Box from '../../components/Box'
import SearchFilterDropdown from '../../components/SearchFilterDropdown'
import SourceForm from './SourceForm'
import UploadCsvForm from './UploadCsvForm'
import UploadExcelForm from './UploadExcelForm'
import AntdFormType from 'antd/lib/form/Form'
import { ButtonProps } from 'antd/lib/button/button'

const message = require('antd/lib/message')
const Modal = require('antd/lib/modal')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Table = require('antd/lib/table')
const Button = require('antd/lib/button')
const Tooltip = require('antd/lib/tooltip')
const Icon = require('antd/lib/icon')
const Popconfirm = require('antd/lib/popconfirm')
const Breadcrumb = require('antd/lib/breadcrumb')

import {
  loadSources,
  addSource,
  deleteSource,
  editSource,
  testSourceConnection,
  getCsvMetaId
} from './actions'
import {
  makeSelectSources,
  makeSelectListLoading,
  makeSelectFormLoading,
  makeSelectTestLoading
} from './selectors'
const utilStyles = require('../../assets/less/util.less')
import api from '../../utils/api'
import { uuid } from '../../utils/util'
import { checkNameUniqueAction } from '../App/actions'
import {makeSelectCurrentProject} from '../Projects/selectors'
import ModulePermission from '../Account/components/checkModulePermission'
import { initializePermission } from '../Account/components/checkUtilPermission'
import {IProject} from '../Projects'

interface ISourceProps {
  params: any
  sources: boolean | any[]
  listLoading: boolean
  formLoading: boolean
  testLoading: boolean
  currentProject: IProject
  onLoadSources: (projectId: number) => any
  onAddSource: (sourceData: any, resolve: any) => any
  onDeleteSource: (id: number) => any
  onEditSource: (sourceData: any, resolve: any) => any
  onTestSourceConnection: (testSource: any) => any
  onGetCsvMetaId: (
    csvMeta: any,
    resolve: any,
    reject: any) => any
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
  onDownLoadCsv: () => any
  onDownLoadExcel: () => any
}

interface ISourceStates {
  tableSource: any[]
  tableSortedInfo: {columnKey?: string, order?: string}
  nameFilterValue: string
  nameFilterDropdownVisible: boolean
  formVisible: boolean
  formType: string
  uploadFormVisible: boolean
  uploadExcelFormVisible: boolean
  formStep: number
  metaObj: any
  isUploadDisabled: boolean
  newUploadModalKey: string
  newUploadExcelKey: string
  screenWidth: number
  uploadType: string
  excelPic: boolean
  csvPic: boolean,
  downloadType: string
}

interface ISourceObject {
  user: string
  password: string
  url: string
  type: string
}

export class Source extends React.PureComponent<ISourceProps, ISourceStates> {
  constructor (props) {
    super(props)
    this.state = {
      tableSource: [],
      tableSortedInfo: {},

      nameFilterValue: '',
      nameFilterDropdownVisible: false,

      formVisible: false,
      formType: 'add',

      uploadFormVisible: false,
      uploadExcelFormVisible: false,
      formStep: 0,
      metaObj: {},
      isUploadDisabled: false,

      newUploadModalKey: '1',
      screenWidth: 0,

      newUploadExcelKey: '2',
      uploadType: '',

      excelPic: false,
      csvPic: false,
      downloadType: ''
    }
  }

  private sourceForm: AntdFormType = null
  private uploadForm: AntdFormType = null
  private uploadExcelForm: AntdFormType = null
  private refHandlers = {
    sourceForm: (ref) => this.sourceForm = ref,
    uploadForm: (ref) => this.uploadForm = ref,
    uploadExcelForm: (ref) => this.uploadExcelForm = ref
  }

  public componentWillMount () {
    this.props.onLoadSources(this.props.params.pid)
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  public componentWillReceiveProps (props) {
    window.onresize = () => this.setState({ screenWidth: document.documentElement.clientWidth })

    if (props.sources) {
      this.setState({
        tableSource: props.sources.map((g) => {
          g.key = g.id
          return g
        })
      })
    }
  }

  private showAdd = () => {
    this.setState({
      formVisible: true,
      formType: 'add'
    })
  }
  private getExcelDownLoad = () => {
    this.setState({
      excelPic: true,
      downloadType: 'excel'
    })
  }

  private getCsvDownLoad = () => {
    this.setState({
      csvPic: true,
      downloadType: 'csv'
    })
  }

  private showDetail = (sourceId) => () => {
    this.setState({
      formVisible: true,
      formType: 'edit'
    }, () => {
      const {
        id,
        name,
        type,
        username,
        password,
        jdbcUrl,
        description,
        config
      } = (this.props.sources as any[]).find((g) => g.id === sourceId)

      const configObj = JSON.parse(config)
      this.sourceForm.props.form.setFieldsValue({
        id,
        name,
        type,
        user: username,
        password,
        url: jdbcUrl,
        desc: description,
        config: configObj.parameters
      })
    })
  }

  private showUpload = (sourceType, sourceId) => () => {
    const redrawKey = uuid(6, 10)
    if (sourceType === 'csv') {
      this.setState({
        newUploadModalKey: redrawKey,
        uploadFormVisible: true,
        uploadType: 'csv'
      }, () => {
        this.uploadForm.props.form.setFieldsValue({
          source_id: sourceId
        })
      })
    } else if (sourceType === 'excel') {
      this.setState({
        newUploadExcelKey: redrawKey,
        uploadExcelFormVisible: true,
        uploadType: 'excel'
      }, () => {
        this.uploadExcelForm.props.form.setFieldsValue({
          source_id: sourceId
        })
      })
    }
  }

  private onModalOk = () => {
    this.sourceForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { params } = this.props
        const { id, name, type, url, user, password, desc, config } = values
        const requestValue = {
          config: {
            parameters: config,
            password,
            url,
            username: user
          },
          description: desc,
          name,
          type,
          projectId: Number(params.pid)
        }

        if (this.state.formType === 'add') {
          this.props.onAddSource({...requestValue}, () => {
            this.hideForm()
          })
        } else {
          this.props.onEditSource({ ...requestValue, id }, () => {
            this.hideForm()
          })
        }
      }
    })
  }

  private changeFormStep = (step, uploadType) => () => {
    const { onGetCsvMetaId } = this.props
    if (uploadType !== '' && uploadType === 'csv') {
      this.uploadForm.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const { table_name, source_id, primary_keys, index_keys, replace_mode } = values
          const csvMeta = {
            table_name,
            source_id,
            replace_mode,
            primary_keys,
            index_keys
          }
          onGetCsvMetaId(csvMeta, () => {
            this.setState({
              metaObj: csvMeta,
              formStep: step
            })
          }, (error) => {
            message.error(error)
          })
        }
      })
    } else if (uploadType !== '' && uploadType === 'excel') {
        this.uploadExcelForm.props.form.validateFieldsAndScroll((err, values) => {
          if (!err) {
            const { table_name, source_id, primary_keys, index_keys, replace_mode } = values
            const csvMeta = {
              table_name,
              source_id,
              replace_mode,
              primary_keys,
              index_keys
            }
            onGetCsvMetaId(csvMeta, () => {
              this.setState({
                metaObj: csvMeta,
                formStep: step
              })
            }, (error) => {
              message.error(error)
            })
          }
        })} else {
      this.setState({
        formStep: step
      })
    }
  }

  private hideForm = () => {
    this.setState({
      formVisible: false
    })
    this.sourceForm.props.form.resetFields()
  }

  private hideUploadForm = () => {
    this.setState({
      uploadFormVisible: false
    }, () => {
      this.setState({formStep: 0})
      this.uploadForm.props.form.resetFields()
    })
  }

  private hideExcelUploadForm = () => {
    this.setState({
      uploadExcelFormVisible: false
    }, () => {
      this.setState({formStep: 0})
      this.uploadExcelForm.props.form.resetFields()
    })
  }

  private hidePic = () => {
    this.setState({
      excelPic : false,
      csvPic: false
    })
   }


  private onUploadFile = () => {
    this.hideUploadForm()
    this.hideExcelUploadForm()
    this.setState({
      isUploadDisabled: false
    })
  }


  private handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      tableSortedInfo: sorter
    })
  }

  private onSearchInputChange = (e) => {
    this.setState({
      nameFilterValue: e.target.value
    })
  }

  private onSearch = () => {
    const val = this.state.nameFilterValue
    const reg = new RegExp(val, 'gi')

    this.setState({
      nameFilterDropdownVisible: false,
      tableSource: (this.props.sources as any[]).map((record) => {
        const match = record.name.match(reg)
        if (!match) {
          return null
        }
        return {
          ...record,
          name: (
            <span>
              {record.name.split(reg).map((text, i) => (
                i > 0 ? [<span key={i} className={utilStyles.highlight}>{match[0]}</span>, text] : text
              ))}
            </span>
          )
        }
      }).filter((record) => !!record)
    })
  }

  private testSourceConnection = () => {
    const formValues = this.sourceForm.props.form.getFieldsValue() as ISourceObject
    const { user, password, url , type} = formValues

    if (url) {
      // 如果得到的类型与选择的类型不一致，则提示，类型不匹配
      // 如果选择了MySQL，则将CSV、Excel两种类型隔离掉 不提示不匹配
      if (url.indexOf('mysql') !== -1 && (type.indexOf('excel') !== -1 || type.indexOf('csv') !== -1)) {
        this.props.onTestSourceConnection({
          username: user,
          password,
          url
        })
      } else if (url.indexOf(type) !== -1) {
        this.props.onTestSourceConnection({
          username: user,
          password,
          url
        })
      } else {
        message.error('连接 Url 类型不匹配')
      }
      } else {
      message.error('连接 Url 都不能为空')
    }
  }

  private uploadOnchange = (info) => {
    if (info.file.status !== 'uploading') {
      const fileLength = info.fileList.length
      if (fileLength === 0) {
        this.setState({
          isUploadDisabled: false
        })
      }
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`)
      this.setState({
        formStep: 2,
        isUploadDisabled: true
      })
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`)
    }
  }

  public render () {
    const {
      tableSource,
      tableSortedInfo,
      nameFilterValue,
      nameFilterDropdownVisible,
      formVisible,
      uploadFormVisible,
      uploadExcelFormVisible,
      formType,
      formStep,
      metaObj,
      isUploadDisabled,
      newUploadModalKey,
      newUploadExcelKey,
      screenWidth,
      uploadType,
      excelPic,
      csvPic,
      downloadType
    } = this.state

    const {
      params,
      listLoading,
      formLoading,
      testLoading,
      onDeleteSource,
      currentProject,
      onCheckUniqueName
    } = this.props

    const AdminButton = ModulePermission<ButtonProps>(currentProject, 'source', true)(Button)
    const EditButton = ModulePermission<ButtonProps>(currentProject, 'source', false)(Button)

    const { table_name, source_id, replace_mode , primary_keys, index_keys} = metaObj
    const uploadProps = {
      name: 'file',
      disabled: isUploadDisabled,
      action: `${api.source}/${source_id}/uploadcsv?tableName=${table_name}&mode=${replace_mode}&primaryKeys=${primary_keys}&indexKeys=${index_keys}`,
      onChange: this.uploadOnchange,
      headers: {
        authorization: `Bearer ${localStorage.getItem('TOKEN')}`
      }
      // onRemove: this.uploadOnRemove
    }

    const uploadExcelProps = {
      name: 'file',
      disabled: isUploadDisabled,
      action: `${api.source}/${source_id}/uploadexcel?tableName=${table_name}&mode=${replace_mode}&primaryKeys=${primary_keys}&indexKeys=${index_keys}`,
      onChange: this.uploadOnchange,
      headers: {
        authorization: `Bearer ${localStorage.getItem('TOKEN')}`
      }
      // onRemove: this.uploadOnRemove
    }

    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      filterDropdown: (
        <SearchFilterDropdown
          placeholder="name"
          value={nameFilterValue}
          onChange={this.onSearchInputChange}
          onSearch={this.onSearch}
        />
      ),
      filterDropdownVisible: nameFilterDropdownVisible,
      onFilterDropdownVisibleChange: (visible) => this.setState({
        nameFilterDropdownVisible: visible
      }),
      sorter: (a, b) => a.name > b.name ? -1 : 1,
      sortOrder: tableSortedInfo.columnKey === 'name' && tableSortedInfo.order
    }, {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    }, {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      filters: [{
        text: 'MYSQL',
        value: 'mysql'
      }, {
        text: 'CSV',
        value: 'csv'
      }, {
          text: 'EXCEL',
          value: 'excel'
        }, {
          text: 'HIVE',
          value: 'hive'
        }, {
        text: 'PRESTO',
        value: 'presto'
      }],
      filterMultiple: false,
      onFilter: (val, record) => record.type === val,
      render: (text, record) => {
        const type = record.type
        switch (type) {
          case 'mysql':
            return 'MYSQL'
          case 'csv':
            return 'CSV'
          case 'excel':
            return 'EXCEL'
          case 'hive':
            return 'HIVE'
          case 'presto':
            return 'PRESTO'
          default:
            break
        }
      }
    }, {
      title: '操作',
      key: 'action',
      width: 135,
      className: `${initializePermission(currentProject, 'sourcePermission') ? utilStyles.textAlignLeft : utilStyles.hide}`,
      render: (text, record) => (
        <span className="ant-table-action-column">
          <Tooltip title="修改">
            <EditButton icon="edit" shape="circle" type="ghost" onClick={this.showDetail(record.id)} />
          </Tooltip>
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={onDeleteSource(record.id)}
          >
            <Tooltip title="删除">
              <AdminButton icon="delete" shape="circle" type="ghost" />
            </Tooltip>
          </Popconfirm>
          {
              record && (record.type === 'csv' || record.type === 'excel') ? <Tooltip title="上传">
              <EditButton icon="upload" shape="circle" type="ghost" onClick={this.showUpload(record.type, record.id)} />
            </Tooltip> : ''
          }
        </span>
      )
    }]

    const pagination = {
      simple: screenWidth < 768 || screenWidth === 768,
      defaultPageSize: 20,
      showSizeChanger: true
    }

    const modalButtons = ([(
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={formLoading}
        disabled={formLoading}
        onClick={this.onModalOk}
      >
        保 存
      </Button>),
      (
      <Button
        key="back"
        size="large"
        onClick={this.hideForm}
      >
        取 消
      </Button>)
    ])
    const uploadFormButtons = formStep
      ? [(
      <Button
          key="submit"
          size="large"
          type="primary"
          onClick={this.onUploadFile}
      >
          确 定
      </Button>)
      ]
      : [(
      <Button
          key="forward"
          size="large"
          type="primary"
          onClick={this.changeFormStep(1, uploadType)}
      >
          下一步
      </Button>)
      ]

    return (
      <Container>
        <Helmet title="Source" />
        <Container.Title>
          <Row>
            <Col span={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="">数据源{/*Source*/}</Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Container.Title>
        <Container.Body>
          <Box>
            <Box.Header>
              <Box.Title>
                <Icon type="bars" />数据连接列表
              </Box.Title>
              <Box.Tools>
                <Tooltip placement="bottom" title="新增">
                  <AdminButton type="primary"  onClick={this.showAdd} >新增 Source</AdminButton>
                  <AdminButton type="primary"  onClick={this.getExcelDownLoad} >显示 Excel模板</AdminButton>
                  <AdminButton type="primary"  onClick={this.getCsvDownLoad} >显示 Csv模板</AdminButton>
                </Tooltip>
              </Box.Tools>
            </Box.Header>
            <Box.Body>
              <Row>
                <Col span={24}>
                  <Table
                    dataSource={tableSource}
                    columns={columns}
                    pagination={pagination}
                    loading={listLoading}
                    onChange={this.handleTableChange}
                    bordered
                  />
                </Col>
              </Row>
              <Modal
                title={`${formType === 'add' ? '新增' : '修改'} Source`}
                wrapClassName="ant-modal-small"
                visible={formVisible}
                footer={modalButtons}
                onCancel={this.hideForm}
              >
                <SourceForm
                  type={formType}
                  projectId={params.pid}
                  testLoading={testLoading}
                  onTestSourceConnection={this.testSourceConnection}
                  onCheckUniqueName={onCheckUniqueName}
                  wrappedComponentRef={this.refHandlers.sourceForm}
                />
              </Modal>
              <Modal
                title="上传CSV"
                key={newUploadModalKey}
                visible={uploadFormVisible}
                wrapClassName="ant-modal-small"
                footer={uploadFormButtons}
                onCancel={this.hideUploadForm}
                uploadType={uploadType}
              >
                <UploadCsvForm
                  step={formStep}
                  uploadProps={uploadProps}
                  wrappedComponentRef={this.refHandlers.uploadForm}
                />
              </Modal>
              <Modal
                title="上传EXCEL"
                key={newUploadExcelKey}
                visible={uploadExcelFormVisible}
                wrapClassName="ant-modal-small"
                footer={uploadFormButtons}
                onCancel={this.hideExcelUploadForm}
                uploadType={uploadType}
              >
                <UploadExcelForm
                  step={formStep}
                  uploadProps={uploadExcelProps}
                  wrappedComponentRef={this.refHandlers.uploadExcelForm}
                />
              </Modal>
              <Modal
                title={`${downloadType === 'excel' ? 'Excel' : 'CSV'} 模板`}
                wrapClassName="ant-modal-middle"
                visible={downloadType === 'excel' ? excelPic : csvPic}
                footer=""
                onCancel={this.hidePic}
              >
                <img style={{width: '100%' }} src={require('../../assets/images/templatePic.png')} />
              </Modal>
            </Box.Body>
          </Box>
        </Container.Body>
      </Container>
    )
  }
}

export function mapDispatchToProps (dispatch) {
  return {
    onLoadSources: (projectId) => dispatch(loadSources(projectId)),
    onAddSource: (source, resolve) => dispatch(addSource(source, resolve)),
    onDeleteSource: (id) => () => dispatch(deleteSource(id)),
    onEditSource: (source, resolve) => dispatch(editSource(source, resolve)),
    onTestSourceConnection: (url) => dispatch(testSourceConnection(url)),
    onGetCsvMetaId: (csvMeta, resolve, reject) => dispatch(getCsvMetaId(csvMeta, resolve, reject)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

const mapStateToProps = createStructuredSelector({
  sources: makeSelectSources(),
  listLoading: makeSelectListLoading(),
  formLoading: makeSelectFormLoading(),
  testLoading: makeSelectTestLoading(),
  currentProject: makeSelectCurrentProject()
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'source', reducer })
const withSaga = injectSaga({ key: 'source', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Source)
