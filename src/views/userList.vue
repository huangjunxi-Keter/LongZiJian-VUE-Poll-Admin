<template>
    <el-card class="page-content">
        <!-- 表头工具 -->
        <el-row>
            <el-form ref="searchForm" :inline="true" :model="searchFormData">
                <el-form-item prop="email">
                    <el-input v-model="searchFormData.email" placeholder="邮箱" />
                </el-form-item>
                <el-form-item prop="nickname">
                    <el-input v-model="searchFormData.nickname" placeholder="昵称" />
                </el-form-item>
                <el-form-item prop="state">
                    <el-select v-model="searchFormData.state" placeholder="状态">
                        <el-option label="全部" :value="null" />
                        <el-option label="启用" :value="0" />
                        <el-option label="停用" :value="1" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="searchFormSubmit(searchForm)">查询</el-button>
                    <el-tooltip content="刷新" placement="top">
                        <el-button icon="Refresh" @click="searchFormReset(searchForm)" />
                    </el-tooltip>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row>
            <el-button type="primary" icon="Plus" @click="openDailog()">新增</el-button>
        </el-row>
        <!-- 表格 -->
        <el-table v-loading="other.isloading" :data="userArry" stripe>
            <el-table-column prop="avatar" label="头像" #default="{ row }">
                <el-avatar :src="getImageUrl(row.avatar)" />
            </el-table-column>
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="nickname" label="昵称" />
            <el-table-column prop="password" label="密码" />
            <el-table-column prop="type" label="类型" :formatter="getTypeStr" />
            <el-table-column prop="state" label="状态" :formatter="getStateStr" />
            <el-table-column fixed="right" label="操作" width="130">
                <template #default="scope">
                    <el-button type="primary" icon="Edit" @click="openDailog(scope)" />
                    <el-button v-if="scope.row.state === 0" type="danger" icon="Lock" @click="chnageUserState(scope, 1)" />
                    <el-button v-else-if="scope.row.state === 1" type="success" icon="Unlock"
                        @click="chnageUserState(scope, 0)" />
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="pagination">
            <el-pagination background layout="prev, pager, next" :total="pagination.total" :page-size="pagination.pageSize"
                :current-page="pagination.currentPage" @update:current-page="changePage" />
        </div>
    </el-card>
    <el-dialog v-model="dialog.dialogVisible" :title="dialog.title" align-center destroy-on-close>
        <user-edit :user="dialog.editUser" />
    </el-dialog>
</template>

<script>
import { reactive, ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getImageUrl } from '@/utils/request';
import { cloneObj } from "@/utils/basic";
import { getUsersCount, getUsers, updateUser } from '@/api/user';
import UserEdit from "@/components/UserEdit.vue";

export default {
    name: 'UserList',
    components: {
        "user-edit": UserEdit
    },
    setup() {
        const data = reactive({
            searchFormData: {
                email: null,
                nickname: null,
                state: null
            },
            userArry: [],
            pagination: { total: 0, pageSize: 10, currentPage: 1 },
            dialog: {
                title: '创建',
                dialogVisible: false,
                editUser: null,
            },
            other: {
                isloading: false,
            }
        });

        const doms = {
            searchForm: ref(),
        }

        const eventCallBacks = {
            searchFormSubmit: (formRef) => {
                formRef.validate(async (valid) => {
                    if (valid) {
                        data.other.isloading = true;
                        let params = data.searchFormData;
                        data.pagination.total = await getUsersCount(params);
                        params.page = data.pagination.currentPage - 1;
                        params.count = data.pagination.pageSize;
                        data.userArry.length = 0;
                        data.userArry.push(...await getUsers(params));
                        data.other.isloading = false;
                    }
                });
            },
            searchFormReset: (formRef) => {
                formRef.resetFields();
                eventCallBacks.searchFormSubmit(doms.searchForm.value);
            },
            openDailog(scope) {
                if (scope) {
                    data.dialog.editUser = scope.row;
                    data.dialog.title = "编辑";
                } else {
                    data.dialog.editUser = null;
                }
                data.dialog.dialogVisible = true;
            },
            chnageUserState: async (scope, state) => {
                let user = cloneObj(scope.row);
                user.state = state;
                let response = await updateUser(user);
                if (response) {
                    eventCallBacks.searchFormSubmit(doms.searchForm.value);
                    ElMessage.success(!state ? "启用成功" : "停用成功");
                }
                else
                    ElMessage.error(!state ? "启用失败" : "停用失败");
            },
            changePage(currentPage) {
                data.pagination.currentPage = currentPage;
                eventCallBacks.searchFormSubmit(doms.searchForm.value);
            }
        }

        const tableFormatter = {
            getTypeStr(row, column, cellValue, index) {
                return cellValue ? "用户" : "管理员"
            },
            getStateStr(row, column, cellValue, index) {
                return cellValue ? "停用" : "启用";
            }
        }

        onMounted(() => {
            eventCallBacks.searchFormSubmit(doms.searchForm.value);
        });

        return {
            ...data,
            ...doms,
            ...eventCallBacks,
            ...tableFormatter,
            getImageUrl
        }
    }
}
</script>

<style scoped></style>