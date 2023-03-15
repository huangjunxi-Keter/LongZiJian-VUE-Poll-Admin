<template>
    <el-card class="page-content">
        <!-- 表头工具 -->
        <el-row>
            <el-form ref="searchForm" :inline="true" :model="searchFormData">
                <el-form-item prop="title">
                    <el-input v-model="searchFormData.title" placeholder="标题" />
                </el-form-item>
                <el-form-item prop="introduce">
                    <el-input v-model="searchFormData.introduce" placeholder="简介" />
                </el-form-item>
                <el-form-item prop="nickname">
                    <el-input v-model="searchFormData.nickname" placeholder="创建人" />
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
        <el-table v-loading="other.isloading" :data="activityArry" stripe>
            <el-table-column prop="activity_title" label="活动标题"/>
            <el-table-column prop="cover_image" label="封面" #default="{ row }">
                <el-avatar shape="square" :size="100" :src="getImageUrl(row.cover_image)" />
            </el-table-column>
            <el-table-column prop="poll_count" label="总票数" />
            <el-table-column prop="item_count" label="投票项目" />
            <el-table-column prop="page_view" label="浏览量" />
            <el-table-column prop="state" label="状态" :formatter="getStateStr" />
            <el-table-column fixed="right" label="操作" width="130">
                <template #default="scope">
                    <el-button type="primary" icon="Edit" @click="openDailog(scope)" />
                    <el-button v-if="scope.row.state === 0" type="danger" icon="Lock" @click="chnageActivityState(scope, 1)" />
                    <el-button v-else-if="scope.row.state === 1" type="success" icon="Unlock"
                        @click="chnageActivityState(scope, 0)" />
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
        <activity-edit :activity="dialog.editActivity" />
    </el-dialog>
</template>

<script>
import { reactive, ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getImageUrl } from '@/utils/request';
import { cloneObj } from "@/utils/basic";
import { findPollActivitys, findPollActivitysCount, updatePollActivity } from '@/api/poll_activity';
import ActivityEdit from "@/components/ActivityEdit.vue";

export default {
    name: 'ActivityList',
    components: {
        "activity-edit": ActivityEdit
    },
    setup() {
        const data = reactive({
            searchFormData: {
                email: null,
                nickname: null,
                state: null
            },
            activityArry: [],
            pagination: { total: 0, pageSize: 5, currentPage: 1 },
            dialog: {
                title: '创建',
                dialogVisible: false,
                editActivity: null,
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
                        data.pagination.total = await findPollActivitysCount(params);
                        params.page = data.pagination.currentPage - 1;
                        params.count = data.pagination.pageSize;
                        data.activityArry.length = 0;
                        data.activityArry.push(...await findPollActivitys(params));
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
                    data.dialog.editActivity = scope.row;
                    data.dialog.title = "编辑";
                } else {
                    data.dialog.editActivity = null;
                }
                data.dialog.dialogVisible = true;
            },
            chnageActivityState: async (scope, state) => {
                let activity = cloneObj(scope.row);
                activity.state = state;
                let response = await updatePollActivity(activity);
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