import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Space } from 'antd';
import React, { useState, useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ModalForm,
  ProFormText,
  ProFormRadio,
  ProFormCheckbox,
  ProTable,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { getRole } from '@/services/role';
import { getUser, postUser, delUser } from '@/services/user';

/**
 * 新增or修改
 *
 * @param fields
 */
const headlePost = async (fields: API.User) => {
  const hide = message.loading('正在保存');
  try {
    let res = await postUser({ ...fields });
    hide();
    if (res && res.code === 0) {
      message.success('保存成功');
      return true;
    }
    message.error(res.msg);
    return false;
  } catch (error) {
    hide();
    message.error('保存失败，请重试！');
    return false;
  }
};

/**
 * 删除
 *
 * @param selectedRows
 */
const handleDel = async (selectedRows: API.User[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  try {
    let res = await delUser(selectedRows.map((record) => record.id));
    hide();
    if (res && res.code === 0) {
      message.success('删除成功');
      return true;
    }
    message.error(res.msg);
    return false;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const Table: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.User>();

  const optButton = (record: API.User, index: number) => (
    <Space key={index}>
      {access.UserUpdate && (
        <a
          onClick={() => {
            setModalVisible(true);
            setCurrentRow(record);
          }}
        >
          修改
        </a>
      )}
    </Space>
  );

  const columns: ProColumns<API.User>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
            }}
          >
            {' '}
            {dom}{' '}
          </a>
        );
      },
    },
    { title: '用户名', dataIndex: 'username' },
    { title: '邮箱', dataIndex: 'email' },
    { title: '手机号', dataIndex: 'mobile' },
    {
      title: '状态',
      dataIndex: 'status',
      sorter: true,
      valueEnum: {
        0: { text: '禁用', status: 'Default' },
        1: { text: '正常', status: 'Success' },
      },
    },
    { title: '创建时间', sorter: true, dataIndex: 'created_at', hideInSearch: true },
    { title: '修改时间', sorter: true, dataIndex: 'updated_at', hideInSearch: true },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record, index) => [optButton(record, index)],
    },
  ];

  return (
    <>
      <PageContainer>
        <ProTable<API.User>
          headerTitle="用户列表"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 120,
          }}
          toolBarRender={() => [
            access.UserAdd && (
              <Button
                type="primary"
                key="primary"
                onClick={() => {
                  setModalVisible(true);
                  setCurrentRow(undefined);
                }}
              >
                <PlusOutlined /> 新增
              </Button>
            ),
          ]}
          request={getUser}
          columns={columns}
          rowSelection={{}}
          tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
            <Space size={24}>
              <span>
                已选 {selectedRowKeys.length} 项
                <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                  取消选择
                </a>
              </span>
            </Space>
          )}
          tableAlertOptionRender={({ selectedRows }) => {
            return (
              access.UserDelete && (
                <Button
                  danger
                  onClick={async () => {
                    await handleDel(selectedRows);
                    actionRef.current?.reloadAndRest?.();
                  }}
                >
                  批量删除
                </Button>
              )
            );
          }}
        />
      </PageContainer>

      <ModalForm<API.User>
        title={currentRow?.id ? '修改' : '新增'}
        layout="horizontal"
        width="500px"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={async (value) => {
          if (currentRow) {
            value = { ...currentRow, ...value, created_at: undefined, updated_at: undefined };
          }
          const success = await headlePost(value);
          if (success) {
            setModalVisible(false);
            setCurrentRow({} as any);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        modalProps={{ destroyOnClose: true }}
      >
        <ProFormText
          rules={[{ required: true, message: '用户名为必填项' }]}
          width="md"
          name="username"
          label="用户名"
          initialValue={currentRow?.username}
          fieldProps={{ id: '1_username' }}
        />
        <ProFormText.Password
          width="md"
          name="password"
          label="密码"
          placeholder="密码(不修改密码可以不填)"
          initialValue={currentRow?.password}
          fieldProps={{ id: '1_password' }}
        />

        <ProFormCheckbox.Group
          name="role_ids"
          layout="horizontal"
          label="角色"
          initialValue={currentRow?.role_ids}
          request={async () => {
            let res = await getRole({});
            let roleSelect = res.data.map((item: API.Role) => {
              return { label: item.name, value: item.id };
            });
            return roleSelect;
          }}
        />

        <ProFormRadio.Group
          name="status"
          label="状态"
          width="md"
          options={[
            { value: 1, label: '正常' },
            { value: 0, label: '禁用' },
          ]}
          initialValue={currentRow ? currentRow?.status : 1}
          fieldProps={{ id: '1_status' }}
        />
      </ModalForm>
    </>
  );
};

export default Table;
