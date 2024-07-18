import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Space, Tag, Popconfirm, Form, TreeSelect } from 'antd';
import React, { useState, useRef } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import {
  PageContainer,
  ProTable,
  ModalForm,
  ProFormRadio,
  ProFormText,
  ProFormDigit,
} from '@ant-design/pro-components';
import { getMenu, postMenu, delMenu } from '@/services/menu';
import { useAccess } from '@umijs/max';
import * as Icon from '@ant-design/icons';

const ICON = Icon as any;
/**
 * icon转化
 *
 * @param icon
 * @param iconType
 * @returns
 */
const iconFormat = (icon: string, iconType = 'Outlined') => {
  const fixIconName: string = icon.slice(0, 1).toLocaleUpperCase() + icon.slice(1) + iconType;
  return React.createElement(ICON[fixIconName] || ICON[icon]);
};

const getMenuSelect = (ms: API.Menu[]) => {
  return ms.map((item) => {
    let obj: any = { title: item.name, value: item.id };
    if (item.children && item.children.length > 0 && item.type === 1) {
      obj['children'] = getMenuSelect(item.children);
    }
    return obj;
  });
};

/**
 * 新增or修改
 *
 * @param fields
 */

const handlePost = async (fields: API.Menu) => {
  const hide = message.loading('正在保存');

  try {
    let res = await postMenu({ ...fields });
    hide();
    if (res && res.code === 0) {
      message.success('保存成功');
      return true;
    }
    message.error(res.msg);
    return false;
  } catch (error) {
    hide();
    message.error('保存失败请重试！');
    return false;
  }
};

/**
 * 删除
 *
 * @param selectedRows
 */
const handleDel = async (selectedRows: API.Menu[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return;

  try {
    let res = await delMenu(selectedRows.map((record) => record.id));
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
  }
};

const Table: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.Menu>();
  const [menuSelectState, setMenuSelectState] = useState<any[]>([]);

  const optButton = (record: API.Menu, index: number) => (
    <Space key={index}>
      {access.MenuUpdate && (
        <a
          onClick={() => {
            setModalVisible(true);
            setCurrentRow(record);
          }}
        >
          修改
        </a>
      )}
      {access.MenuDelete && (
        <Popconfirm
          title="确定删除?"
          onConfirm={() => {
            handleDel([record]);
            actionRef.current?.reloadAndRest?.();
          }}
        >
          <a>删除</a>
        </Popconfirm>
      )}
    </Space>
  );

  const columns: ProColumns<API.Menu>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (_, record) => (
        <Space key={record.id}>
          {record.type === 1 && <Tag color={'success'}>目录</Tag>}
          {record.type === 2 && <Tag color={'blue'}>菜单</Tag>}
          {record.type === 3 && <Tag color={'geekblue'}>按钮</Tag>}
        </Space>
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '菜单URL',
      dataIndex: 'path',
    },
    {
      title: '权限标识',
      dataIndex: 'perms',
    },
    {
      title: '菜单图标',
      dataIndex: 'icon',
      render: (_, record, index) => [
        record.icon ? <Space key={index}>{iconFormat(record.icon)}</Space> : '-',
      ],
    },
    {
      title: '状态',
      dataIndex: 'status',
      sorter: true,
      valueEnum: {
        0: {
          text: '禁用',
          status: 'Error',
        },
        1: {
          text: '正常',
          status: 'Success',
        },
        2: {
          text: '隐藏',
          status: 'Warning',
        },
      },
    },
    {
      title: '排序',
      dataIndex: 'sort',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record, index) => [optButton(record, index)],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Menu>
        headerTitle="菜单列表"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          access.MenuAdd && (
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
        request={async () => {
          const res = await getMenu();
          let selectMenu = [{ title: '一级菜单', value: 0, children: getMenuSelect(res.data) }];
          console.log('selectMenu:', selectMenu);
          setMenuSelectState(selectMenu);
          return {
            data: res.data,
            success: true,
          };
        }}
        columns={columns}
        pagination={false}
      />

      <ModalForm<API.Menu>
        title={currentRow?.id ? '修改' : '新增'}
        layout="horizontal"
        width="500px"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 17 }}
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={async (value) => {
          if (currentRow) {
            value = {
              ...currentRow,
              ...value,
              children: undefined,
              created_at: undefined,
              updated_at: undefined,
            };
          }
          const success = await handlePost(value);
          if (success) {
            setModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        modalProps={{ destroyOnClose: true }}
      >
        <ProFormRadio.Group
          name="type"
          label="类型"
          radioType="button"
          initialValue={currentRow?.type ? currentRow?.type : 1}
          disabled={!!currentRow?.id}
          options={[
            { label: '目录', value: 1 },
            { label: '菜单', value: 2 },
            { label: '按钮', value: 3 },
          ]}
        />

        <Form.Item noStyle shouldUpdate>
          {(form) => (
            <>
              <Form.Item
                name="pid"
                label="上级类目"
                initialValue={currentRow?.pid ? currentRow?.pid : 0}
              >
                <TreeSelect
                  showSearch
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  treeData={menuSelectState}
                  treeDefaultExpandAll
                />
              </Form.Item>
            </>
          )}
        </Form.Item>

        <ProFormText
          rules={[{ required: true, message: '名称为必填项' }]}
          width="md"
          name="name"
          label="名称"
          initialValue={currentRow?.name}
        />
        <Form.Item noStyle shouldUpdate>
          {(form) => (
            <>
              {form.getFieldValue('type') === 1 && (
                <ProFormText
                  rules={[{ required: true, message: '菜单图标为必填项' }]}
                  width="xs"
                  name="icon"
                  label="菜单图标"
                  initialValue={currentRow?.icon}
                  addonAfter={
                    <a href="https://ant.design/components/icon-cn" target="_blank">
                      获取Icon
                    </a>
                  }
                />
              )}
            </>
          )}
        </Form.Item>
        <Form.Item noStyle shouldUpdate>
          {(form) => (
            <>
              {form.getFieldValue('type') === 2 && (
                <ProFormText
                  rules={[{ required: true, message: '菜单URL为必填项' }]}
                  width="md"
                  name="path"
                  label="菜单URL"
                  initialValue={currentRow?.path}
                />
              )}
            </>
          )}
        </Form.Item>
        <Form.Item noStyle shouldUpdate>
          {(form) => (
            <>
              {form.getFieldValue('type') === 3 && (
                <ProFormText
                  rules={[{ required: true, message: '授权为必填项' }]}
                  width="md"
                  name="perms"
                  label="授权"
                  initialValue={currentRow?.perms}
                />
              )}
            </>
          )}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {(form) => (
            <>
              {form.getFieldValue('type') !== 3 && (
                <ProFormRadio.Group
                  name="status"
                  label="状态"
                  width="md"
                  options={[
                    { value: 1, label: '正常' },
                    { value: 0, label: '禁用' },
                    { value: 2, label: '隐藏' },
                  ]}
                  initialValue={currentRow ? currentRow?.status : 1}
                />
              )}
            </>
          )}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {(form) => (
            <>
              {form.getFieldValue('type') !== 3 && (
                <ProFormDigit
                  rules={[{ required: true, message: '排序为必填项' }]}
                  width="md"
                  name="sort"
                  label="排序"
                  initialValue={currentRow?.sort ? currentRow?.sort : 100}
                />
              )}
            </>
          )}
        </Form.Item>
      </ModalForm>
    </PageContainer>
  );
};

export default Table;
