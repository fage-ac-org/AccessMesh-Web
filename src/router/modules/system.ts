const Layout = () => import("@/layout/index.vue");

export default {
  path: "/system",
  name: "System",
  component: Layout,
  redirect: "/system/organization",
  meta: {
    icon: "ep:setting",
    title: "系统管理",
    rank: 10
  },
  children: [
    {
      path: "/system/organization",
      name: "SystemOrganization",
      component: () => import("@/views/system/organization/index.vue"),
      meta: {
        title: "组织管理",
        showLink: true,
        roles: ["admin"]
      }
    }
  ]
} satisfies RouteConfigsTable;
