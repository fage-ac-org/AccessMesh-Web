import { http } from "@/utils/http";

/** 组织类型 */
export type Organization = {
  id: number;
  parentId: number | null;
  name: string;
  code: string;
  type: "company" | "department" | "team";
  sort: number;
  status: 0 | 1;
  leader?: string;
  phone?: string;
  email?: string;
  remark?: string;
  children?: Organization[];
  createTime?: string;
  updateTime?: string;
};

/** 组织查询参数 */
export type OrganizationQuery = {
  name?: string;
  code?: string;
  type?: string;
  status?: number;
};

/** 组织表单数据 */
export type OrganizationForm = Omit<
  Organization,
  "id" | "createTime" | "updateTime" | "children"
>;

/** 组织列表结果 */
export type OrgListResult = {
  success: boolean;
  data: Organization[];
};

/** 组织详情结果 */
export type OrgDetailResult = {
  success: boolean;
  data: Organization;
};

/** 操作结果 */
export type OrgOperateResult = {
  success: boolean;
  message?: string;
};

/** 获取组织列表 */
export const getOrganizationList = (params?: OrganizationQuery) => {
  return http.request<OrgListResult>("get", "/organization/list", { params });
};

/** 获取组织树 */
export const getOrganizationTree = () => {
  return http.request<OrgListResult>("get", "/organization/tree");
};

/** 获取组织详情 */
export const getOrganizationDetail = (id: number) => {
  return http.request<OrgDetailResult>("get", `/organization/${id}`);
};

/** 新增组织 */
export const addOrganization = (data: OrganizationForm) => {
  return http.request<OrgOperateResult>("post", "/organization", { data });
};

/** 修改组织 */
export const updateOrganization = (id: number, data: OrganizationForm) => {
  return http.request<OrgOperateResult>("put", `/organization/${id}`, { data });
};

/** 删除组织 */
export const deleteOrganization = (id: number) => {
  return http.request<OrgOperateResult>("delete", `/organization/${id}`);
};
