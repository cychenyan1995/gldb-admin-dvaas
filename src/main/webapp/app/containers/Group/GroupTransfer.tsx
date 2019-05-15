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

const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Transfer = require('antd/lib/transfer')

interface IGroupTransferProps {
  source: any[]
  target: any[]
  onChange: (nextTargetKeys: any) => void
}

const getRowKey = (s) => s.id
const transferRender = (item) => item.name
const onChange = (cb) => (nextTargetKeys, direction, moveKeys) => {
  cb(nextTargetKeys)
}

export function GroupTransfer (props: IGroupTransferProps) {
  return (
    <Row>
      <Col span={24}>
        <Transfer
          titles={['列表', '已选']}
          listStyle={{width: '220px'}}
          dataSource={props.source}
          rowKey={getRowKey}
          targetKeys={props.target}
          render={transferRender}
          onChange={onChange(props.onChange)}
        />
      </Col>
    </Row>
  )
}

export default GroupTransfer
