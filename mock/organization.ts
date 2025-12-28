// 组织管理 Mock 数据
import { defineFakeRoute } from "vite-plugin-fake-server/client";

// 模拟组织数据
const organizationTree = [
  {
    id: 1,
    parentId: null,
    name: "AccessMesh科技有限公司",
    code: "ACCESSMESH",
    type: "company",
    sort: 1,
    status: 1,
    leader: "张总",
    phone: "13800000001",
    email: "zhang@accessmesh.com",
    remark: "总公司",
    createTime: "2024-01-01 00:00:00",
    updateTime: "2024-06-01 10:30:00",
    children: [
      {
        id: 2,
        parentId: 1,
        name: "技术研发中心",
        code: "RD",
        type: "department",
        sort: 1,
        status: 1,
        leader: "李经理",
        phone: "13800000002",
        email: "li@accessmesh.com",
        createTime: "2024-01-15 00:00:00",
        updateTime: "2024-05-20 15:30:00",
        children: [
          {
            id: 4,
            parentId: 2,
            name: "前端开发组",
            code: "RD-FE",
            type: "team",
            sort: 1,
            status: 1,
            leader: "王工",
            phone: "13800000004",
            email: "wang@accessmesh.com",
            createTime: "2024-02-01 00:00:00",
            updateTime: "2024-05-15 09:20:00"
          },
          {
            id: 5,
            parentId: 2,
            name: "后端开发组",
            code: "RD-BE",
            type: "team",
            sort: 2,
            status: 1,
            leader: "赵工",
            phone: "13800000005",
            email: "zhao@accessmesh.com",
            createTime: "2024-02-01 00:00:00",
            updateTime: "2024-05-10 14:10:00"
          },
          {
            id: 6,
            parentId: 2,
            name: "测试组",
            code: "RD-QA",
            type: "team",
            sort: 3,
            status: 0,
            leader: "陈工",
            phone: "13800000006",
            email: "chen@accessmesh.com",
            createTime: "2024-02-15 00:00:00",
            updateTime: "2024-04-25 16:45:00"
          }
        ]
      },
      {
        id: 3,
        parentId: 1,
        name: "市场运营部",
        code: "MKT",
        type: "department",
        sort: 2,
        status: 1,
        leader: "孙经理",
        phone: "13800000003",
        email: "sun@accessmesh.com",
        createTime: "2024-01-20 00:00:00",
        updateTime: "2024-06-15 11:00:00",
        children: [
          {
            id: 7,
            parentId: 3,
            name: "品牌推广组",
            code: "MKT-BRAND",
            type: "team",
            sort: 1,
            status: 1,
            leader: "周专员",
            phone: "13800000007",
            email: "zhou@accessmesh.com",
            createTime: "2024-03-01 00:00:00",
            updateTime: "2024-06-10 08:30:00"
          },
          {
            id: 8,
            parentId: 3,
            name: "新媒体运营组",
            code: "MKT-NEW",
            type: "team",
            sort: 2,
            status: 1,
            leader: "吴专员",
            phone: "13800000008",
            email: "wu@accessmesh.com",
            createTime: "2024-03-10 00:00:00",
            updateTime: "2024-06-12 10:15:00"
          }
        ]
      }
    ]
  }
];

// ID 自增计数器
let idCounter = 9;

export default defineFakeRoute([
  // 获取组织树
  {
    url: "/organization/tree",
    method: "get",
    response: () => {
      return {
        success: true,
        data: organizationTree
      };
    }
  },

  // 获取组织列表（带查询条件）
  {
    url: "/organization/list",
    method: "get",
    response: ({ query }) => {
      // 简单过滤逻辑
      let result = JSON.parse(JSON.stringify(organizationTree));

      const filterTree = (nodes: any[], filters: any): any[] => {
        return nodes
          .map(node => {
            const children = node.children
              ? filterTree(node.children, filters)
              : [];
            const matchName = !filters.name || node.name.includes(filters.name);
            const matchCode = !filters.code || node.code.includes(filters.code);
            const matchType = !filters.type || node.type === filters.type;
            const matchStatus =
              filters.status === undefined ||
              filters.status === "" ||
              node.status === Number(filters.status);

            if (matchName && matchCode && matchType && matchStatus) {
              return { ...node, children };
            }
            return children.length > 0 ? { ...node, children } : null;
          })
          .filter(Boolean);
      };

      result = filterTree(result, query);

      return {
        success: true,
        data: result
      };
    }
  },

  // 获取组织详情
  {
    url: "/organization/:id",
    method: "get",
    response: ({ params }) => {
      const findNode = (nodes: any[], id: number): any => {
        for (const node of nodes) {
          if (node.id === Number(id)) return node;
          if (node.children) {
            const found = findNode(node.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const node = findNode(organizationTree, Number(params.id));

      if (node) {
        return {
          success: true,
          data: node
        };
      } else {
        return {
          success: false,
          message: "组织不存在"
        };
      }
    }
  },

  // 新增组织
  {
    url: "/organization",
    method: "post",
    response: ({ body }) => {
      const newOrg = {
        ...body,
        id: idCounter++,
        createTime: new Date().toLocaleString(),
        updateTime: new Date().toLocaleString(),
        children: []
      };

      // 如果有 parentId，添加到对应节点
      if (body.parentId) {
        const addToParent = (nodes: any[]): boolean => {
          for (const node of nodes) {
            if (node.id === body.parentId) {
              node.children = node.children || [];
              node.children.push(newOrg);
              return true;
            }
            if (node.children) {
              if (addToParent(node.children)) return true;
            }
          }
          return false;
        };
        addToParent(organizationTree);
      } else {
        organizationTree.push(newOrg);
      }

      return {
        success: true,
        message: "新增成功"
      };
    }
  },

  // 修改组织
  {
    url: "/organization/:id",
    method: "put",
    response: ({ params, body }) => {
      const updateNode = (nodes: any[]): boolean => {
        for (const node of nodes) {
          if (node.id === Number(params.id)) {
            Object.assign(node, body, {
              updateTime: new Date().toLocaleString()
            });
            return true;
          }
          if (node.children) {
            if (updateNode(node.children)) return true;
          }
        }
        return false;
      };

      if (updateNode(organizationTree)) {
        return {
          success: true,
          message: "修改成功"
        };
      } else {
        return {
          success: false,
          message: "组织不存在"
        };
      }
    }
  },

  // 删除组织
  {
    url: "/organization/:id",
    method: "delete",
    response: ({ params }) => {
      const deleteNode = (nodes: any[]): boolean => {
        const index = nodes.findIndex((n: any) => n.id === Number(params.id));
        if (index > -1) {
          nodes.splice(index, 1);
          return true;
        }
        for (const node of nodes) {
          if (node.children && deleteNode(node.children)) return true;
        }
        return false;
      };

      if (deleteNode(organizationTree)) {
        return {
          success: true,
          message: "删除成功"
        };
      } else {
        return {
          success: false,
          message: "组织不存在"
        };
      }
    }
  }
]);
