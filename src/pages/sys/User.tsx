import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Space, Popconfirm } from 'antd';
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
import { useAccess, request } from '@umijs/max';

/**
 * 删除
 *
 * @param ids
 */
const del = async (ids: any) => {
  const hide = message.loading('正在删除');
  try {
    let res = await request('/api/user', { method: 'DELETE', data: { ids } });
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
  const ref = useRef<ActionType>();

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [row, setRow] = useState<any>();

  const opt = (row: any, index: number) => (
    <Space key={index}>
      {access.UserUpdate && (
        <a
          onClick={() => {
            setModalVisible(true);
            setRow(row);
          }}
        >
          修改
        </a>
      )}
      {access.UserDelete && (
        <Popconfirm
          title="确定删除?"
          onConfirm={async () => {
            const res = await del([row.id]);
            if (res) {
              ref.current?.reset?.();
            }
          }}
        >
          <a>删除</a>
        </Popconfirm>
      )}
    </Space>
  );

  const columns: ProColumns[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setRow(entity);
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
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'created_at',
      hideInSearch: true,
    },
    {
      title: '修改时间',
      sorter: true,
      dataIndex: 'updated_at',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, row, index) => [opt(row, index)],
    },
  ];

  return (
    <>
      <PageContainer>
        <ProTable
          headerTitle="用户列表"
          actionRef={ref}
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
                  setRow({});
                }}
              >
                <PlusOutlined /> 新增
              </Button>
            ),
          ]}
          request={async (req) =>
            await request('/api/user', {
              method: 'GET',
              params: { page: req.current, limit: req.pageSize, ...req },
            })
          }
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
                    const res = await del(selectedRows.map((item: any) => item.id));
                    if (res) {
                      ref.current?.reset?.();
                    }
                  }}
                >
                  批量删除
                </Button>
              )
            );
          }}
        />
      </PageContainer>

      <ModalForm
        title={row?.id ? '修改' : '新增'}
        layout="horizontal"
        width="500px"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={async (params) => {
          params = { ...params, id: row?.id };
          const hide = message.loading('正在保存');
          try {
            const res = await request('/api/user', { method: 'POST', data: params });
            hide();
            if (res && res.code === 0) {
              message.success('保存成功');
              setModalVisible(false);
              ref.current?.reset?.();
            } else {
              message.error(res.msg);
            }
          } catch (error) {
            hide();
            message.error('保存失败，请重试');
          }
        }}
        modalProps={{ destroyOnClose: true }}
      >
        <ProFormText
          rules={[{ required: true, message: '用户名为必填项' }]}
          width="md"
          name="username"
          label="用户名"
          initialValue={row?.username}
        />
        <ProFormText.Password
          width="md"
          name="password"
          label="密码"
          placeholder="密码(不修改密码可以不填)"
          initialValue={row?.password}
        />

        <ProFormCheckbox.Group
          name="role_ids"
          layout="horizontal"
          label="角色"
          initialValue={row?.role_ids}
          request={async () => {
            let res = await request('/api/role', {
              method: 'GET',
              params: { page: 1, limit: 1000 },
            });
            let roleSelect = res.data.map((item: any) => {
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
          initialValue={row ? row?.status : 1}
        />
      </ModalForm>
    </>
  );
};

export default Table;
