<template>
    <el-card class="page-content">
        <!-- 表头工具 -->
        <el-row>
            <el-form ref="searchForm" :inline="true" :model="searchFormData">
                <el-form-item prop="activityId">
                    <el-select filterable remote placeholder="所属活动" v-model="searchFormData.activityId"
                        :remote-method="remoteMethod">
                        <el-option v-for="item in other.activityArry" :key="item.id" :value="item.id"
                            :label="item.activity_title" />
                    </el-select>
                </el-form-item>
                <el-form-item prop="title">
                    <el-input v-model="searchFormData.title" placeholder="标题" />
                </el-form-item>
                <el-form-item prop="introduce">
                    <el-input v-model="searchFormData.introduce" placeholder="简介" />
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
        <el-table v-loading="other.isloading" :data="activityItemArry" stripe>
            <el-table-column prop="item_title" label="项目名称" />
            <el-table-column prop="item_image" label="封面" #default="{ row }">
                <el-avatar shape="square" :size="100" :src="getImageUrl(row.item_image)" />
            </el-table-column>
            <el-table-column prop="item_poll" label="票数" />
            <el-table-column prop="item_introduce" label="介绍" />
            <el-table-column fixed="right" label="操作" width="130">
                <template #default="scope">
                    <el-button type="primary" icon="Edit" @click="openDailog(scope)" />
                    <el-button type="danger" icon="Delete" @click="deleteActivityItem(scope)" />
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="pagination">
            <el-pagination background layout="prev, pager, next" :total="pagination.total" :page-size="pagination.pageSize"
                :current-page="pagination.currentPage" @update:current-page="changePage" />
        </div>
    </el-card>
    <el-dialog v-model="dialog.dialogVisible" :title="dialog.title" width="425" align-center destroy-on-close>
        <activity-item-edit :activityItem="dialog.editActivityItem" />
    </el-dialog>
</template>

<script>
import { reactive, ref, onMounted } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { getImageUrl } from '@/utils/request';
import { findPollActivitys } from "@/api/poll_activity";
import { findPollActivityItemsCount, findPollActivityItems, deletePollActivityItem } from '@/api/poll_activity_item';
import ActivityEditItem from "@/components/ActivityEditItem.vue";

export default {
    name: 'ActivityList',
    components: {
        "activity-item-edit": ActivityEditItem
    },
    setup() {
        const data = reactive({
            searchFormData: {
                email: null,
                nickname: null,
                activityId: null
            },
            activityItemArry: [],
            pagination: { total: 0, pageSize: 5, currentPage: 1 },
            dialog: {
                title: '创建',
                dialogVisible: false,
                editActivityItem: null,
            },
            other: {
                activityArry: [],
                isloading: false
            }
        });

        const doms = {
            searchForm: ref(),
        }

        const eventCallBacks = {
            remoteMethod: async (searchStr) => {
                if (searchStr) {
                    data.other.activityArry.length = 0;
                    data.other.activityArry.push(...await findPollActivitys({ title: searchStr }));
                } else {
                    data.other.activityArry.length = 0;
                }
            },
            searchFormSubmit: (formRef) => {
                formRef.validate(async (valid) => {
                    if (valid) {
                        data.other.isloading = true;
                        let params = data.searchFormData;
                        data.pagination.total = await findPollActivityItemsCount(params);
                        params.page = data.pagination.currentPage - 1;
                        params.count = data.pagination.pageSize;
                        data.activityItemArry.length = 0;
                        data.activityItemArry.push(...await findPollActivityItems(params));
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
                    data.dialog.editActivityItem = scope.row;
                    data.dialog.title = "编辑";
                } else {
                    data.dialog.editActivityItem = null;
                }
                data.dialog.dialogVisible = true;
            },
            deleteActivityItem(scope) {
                ElMessageBox.confirm(
                    `确定要删除【${scope.row.item_title}】吗`,
                    '确认操作',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                    }
                ).then(async () => {
                    let response = await deletePollActivityItem(scope.row);
                    if (response) {
                        ElMessage.success("删除成功");
                        eventCallBacks.searchFormSubmit(doms.searchForm.value);
                    }
                    else
                        ElMessage.success("删除失败");
                });
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