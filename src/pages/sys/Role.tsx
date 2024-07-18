import React, { useState, useEffect, useRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Space, Popconfirm, Tree, Tag } from 'antd';
import {
  PageContainer,
  ProCard,
  ModalForm,
  ProFormText,
  ProTable,
  ProColumns,
} from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import global from '@/global.less';
import { postRole, delRole, getRole } from '@/services/role';
import { getMenu } from '@/services/menu';
/**
 * 新增or修改
 *
 * @param fields
 */

const handlePost = async (fields: any) => {
  const hide = message.loading('正在保存');
  try {
    fields = { ...fields, created_at: undefined, updated_at: undefined };
    let res = await postRole(fields);
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
const handleRemove = async (selectedRows: API.Role[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    let res = await delRole(selectedRows.map((record) => record.id));
    hide();
    if (res && res.code === 0) {
      message.success('删除成功');
      return true;
    }
    message.error(res.msg);
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
  }
  return false;
};

const getMenuRole = (ms: API.Menu[]) => {
  return ms.map((item) => {
    let m: any = { title: item.name, key: item.id };
    if (item.children && item.children.length > 0) {
      m['children'] = getMenuRole(item.children);
    }
    return m;
  });
};

// 获取全部子节点id

const getChildMenuIds = (menus: any[]) => {
  const ids = new Array<number>();
  getChildMenuIdsRec(menus, ids);
  return ids;
};
const getChildMenuIdsRec = (menus: any[], ids: number[]) => {
  menus.forEach((e) => {
    if (e.children && e.children.length > 0) {
      getChildMenuIdsRec(e.children, ids);
    } else {
      ids.push(e.id);
    }
  });
};

const Role: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<API.Role>();
  const [checkedMenuIds, setCheckedMenuIds] = useState<number[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.Role>();
  const [treeData, setTreeData] = useState<any[]>([]);
  const [childMenuIds, setChildMenuIds] = useState<number[]>([]);

  const access = useAccess();
  const actionRef = useRef<ActionType>();

  useEffect(() => {
    (async () => {
      let res = await getMenu();
      if (res && res.code === 0) {
        setTreeData(getMenuRole(res.data));
        setChildMenuIds(getChildMenuIds(res.data));
      }
    })();
  }, [selectedRole]);

  // 只保留包含在全部子节点id中的id
  const uniqueChildMenuIds = (ids: number[]) => {
    let uniqueChild: number[] = [];
    if (ids && ids.length > 0) {
      childMenuIds.forEach((e) => {
        ids.forEach((i) => {
          if (e === i) {
            uniqueChild.push(i);
          }
        });
      });
    }
    return uniqueChild;
  };

  const optButton = (record: API.Role, index: number) => (
    <Space key={index}>
      {access.RoleUpdate && (
        <a
          onClick={() => {
            setModalVisible(true);
            setCurrentRow(record);
          }}
        >
          修改
        </a>
      )}
      {access.RoleDelete && (
        <Popconfirm
          title="确定删除?"
          onConfirm={() => {
            handleRemove([record]);
            actionRef.current?.reloadAndRest?.();
          }}
        >
          <a>删除</a>
        </Popconfirm>
      )}
    </Space>
  );

  const columns: ProColumns<API.Role>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      hideInSearch: true,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      hideInSearch: true,
    },
    {
      title: '修改时间',
      dataIndex: 'updated_at',
      hideInSearch: true,
    },
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
        <ProCard gutter={8}>
          <ProCard title="角色列表" colSpan={14} headerBordered bordered>
            <ProTable<API.Role>
              actionRef={actionRef}
              rowKey="id"
              search={false}
              toolBarRender={() => [
                access.RoleAdd && (
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
              request={getRole}
              columns={columns}
              rowClassName={(record) => {
                return selectedRole && record.id === selectedRole.id ? global.tableSelected : '';
              }}
              onRow={(record) => {
                return {
                  onClick: () => {
                    setSelectedRole(record);
                    const menu_ids = uniqueChildMenuIds(record.menu_ids as number[]);
                    setCheckedMenuIds(menu_ids);
                  },
                };
              }}
            />
          </ProCard>
          <ProCard
            title="菜单分配"
            colSpan={10}
            headerBordered
            bordered
            extra={
              selectedRole?.name && (
                <>
                  <Tag color="red">{selectedRole?.name}</Tag>
                  <Button
                    type="primary"
                    key="primary"
                    onClick={async () => {
                      if (selectedRole?.id) {
                        await handlePost(selectedRole);
                      }
                    }}
                  >
                    保存
                  </Button>
                </>
              )
            }
          >
            <Tree
              checkable
              defaultExpandAll={true}
              checkedKeys={checkedMenuIds}
              onCheck={(checked: any, info: any) => {
                // 获取选中和父级半选
                const data: number[] = checked.concat(info.halfCheckedKeys);
                setSelectedRole({ ...selectedRole, menu_ids: data } as API.Role);
                setCheckedMenuIds(checked);
              }}
              treeData={treeData}
            />
          </ProCard>
        </ProCard>

        <ModalForm<API.Role>
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
          <ProFormText
            rules={[{ required: true, message: '角色名称为必填项' }]}
            width="md"
            name="name"
            label="角色名称"
            initialValue={currentRow?.name}
            fieldProps={{ id: '1_name' }}
          />
        </ModalForm>
      </PageContainer>
    </>
  );
};

export default Role;
