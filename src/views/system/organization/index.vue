<script setup lang="ts">
import { ref, reactive, nextTick } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import type { FormInstance } from "element-plus";
import {
  getOrganizationTree,
  addOrganization,
  updateOrganization,
  deleteOrganization
} from "@/api/organization";
import type { Organization, OrganizationForm } from "@/api/organization";

defineOptions({
  name: "SystemOrganization"
});

// 查询表单（支持多选）
const queryForm = reactive({
  name: "",
  code: "",
  type: [] as string[],
  status: [] as number[]
});

// 表格数据
const tableData = ref<Organization[]>([]);
const loading = ref(false);
const editingId = ref<number | null>(null);

// 弹窗
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();

// 表单数据（支持多选）
const form = reactive<OrganizationForm>({
  parentId: null,
  name: "",
  code: "",
  type: "department",
  sort: 1,
  status: 1,
  leader: "",
  phone: "",
  email: "",
  remark: ""
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入组织名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入组织编码", trigger: "blur" }],
  type: [{ required: true, message: "请选择组织类型", trigger: "change" }]
};

// 组织类型选项
const typeOptions = [
  { label: "公司", value: "company" },
  { label: "部门", value: "department" },
  { label: "小组", value: "team" }
];

// 状态选项
const statusOptions = [
  { label: "禁用", value: 0 },
  { label: "启用", value: 1 }
];

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const res = await getOrganizationTree();
    if (res.data) {
      tableData.value = res.data;
    }
  } catch (error) {
    console.error("加载组织树失败", error);
  } finally {
    loading.value = false;
  }
};

// 重置查询
const resetQuery = () => {
  queryForm.name = "";
  queryForm.code = "";
  queryForm.type = [];
  queryForm.status = [];
  loadData();
};

// 打开新增弹窗
const handleAdd = (row?: Organization) => {
  editingId.value = null;
  dialogVisible.value = true;
  nextTick(() => {
    formRef.value?.resetFields();
  });
  // 重置表单
  form.parentId = row?.id ?? null;
  form.name = "";
  form.code = "";
  form.type = "department";
  form.sort = 1;
  form.status = 1;
  form.leader = "";
  form.phone = "";
  form.email = "";
  form.remark = "";
};

// 打开编辑弹窗
const handleEdit = (row: Organization) => {
  editingId.value = row.id;
  dialogVisible.value = true;
  nextTick(() => {
    formRef.value?.resetFields();
  });
  // 填充表单
  Object.assign(form, {
    parentId: row.parentId,
    name: row.name,
    code: row.code,
    type: row.type,
    sort: row.sort,
    status: row.status,
    leader: row.leader || "",
    phone: row.phone || "",
    email: row.email || "",
    remark: row.remark || ""
  });
};

// 保存
const handleSave = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (valid) {
      try {
        if (editingId.value === null) {
          await addOrganization(form);
          message("新增成功", { type: "success" });
        } else {
          await updateOrganization(editingId.value, form);
          message("修改成功", { type: "success" });
        }
        dialogVisible.value = false;
        loadData();
      } catch {
        console.error("保存失败");
      }
    }
  });
};

// 删除
const handleDelete = async (row: Organization) => {
  try {
    await deleteOrganization(row.id);
    message("删除成功", { type: "success" });
    loadData();
  } catch {
    console.error("删除失败");
  }
};

// 确认删除
const onDelete = (row: Organization) => {
  ElMessageBox.confirm(`确定要删除组织 "${row.name}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    handleDelete(row);
  });
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  formRef.value?.resetFields();
};

// 状态样式
const statusStyle = (status: number): "success" | "info" => {
  return status === 1 ? "success" : "info";
};

// 初始化
loadData();
</script>

<template>
  <div class="organization-container">
    <!-- 查询表单 -->
    <el-card shadow="never" class="mb-4">
      <el-form :model="queryForm" inline>
        <el-form-item label="组织名称">
          <el-input
            v-model="queryForm.name"
            placeholder="请输入组织名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="组织编码">
          <el-input
            v-model="queryForm.code"
            placeholder="请输入组织编码"
            clearable
          />
        </el-form-item>
        <el-form-item label="组织类型">
          <el-select
            v-model="queryForm.type"
            placeholder="请选择"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            class="w-50"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryForm.status"
            placeholder="请选择"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            class="w-50"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">
            <el-icon><ep:search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><ep:refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <div class="mb-4">
      <el-button
        v-auth="'system:organization:add'"
        type="primary"
        @click="handleAdd()"
      >
        <el-icon><ep:plus /></el-icon>
        新增组织
      </el-button>
    </div>

    <!-- 树形表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        row-key="id"
        default-expand-all
      >
        <el-table-column prop="name" label="组织名称" min-width="180">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'company'" type="primary" size="small"
              >公司</el-tag
            >
            <el-tag
              v-else-if="row.type === 'department'"
              type="success"
              size="small"
              >部门</el-tag
            >
            <el-tag v-else type="warning" size="small">小组</el-tag>
            <span class="ml-2">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="组织编码" width="150" />
        <el-table-column prop="leader" label="负责人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusStyle(row.status)" size="small">
              {{ row.status === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column
          prop="remark"
          label="备注"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              v-auth="'system:organization:add'"
              link
              type="primary"
              @click="handleAdd(row)"
            >
              新增
            </el-button>
            <el-button
              v-auth="'system:organization:edit'"
              link
              type="primary"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-auth="'system:organization:delete'"
              link
              type="danger"
              @click="onDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId === null ? '新增组织' : '编辑组织'"
      width="600px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="上级组织" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="tableData"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            check-strictly
            placeholder="请选择上级组织（不选则为顶级）"
            clearable
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="组织名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入组织名称" />
        </el-form-item>
        <el-form-item label="组织编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入组织编码" />
        </el-form-item>
        <el-form-item label="组织类型" prop="type">
          <el-select
            v-model="form.type"
            placeholder="请选择"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            class="w-full"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="form.sort"
            :min="1"
            :max="999"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="form.leader" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="form.status"
            placeholder="请选择"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            class="w-full"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.organization-container {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
