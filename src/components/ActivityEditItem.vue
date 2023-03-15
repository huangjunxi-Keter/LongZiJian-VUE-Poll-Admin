<template>
    <el-form v-loading="other.isLoading" ref="activityItemForm" :model="activityItemFormData" :rules="activityItemFormRules"
        label-width="80">
        <el-form-item label="所属活动" prop="activity_id">
            <el-select filterable remote placeholder="请输入标题并选中" v-model="activityItemFormData.activity_id"
                :remote-method="remoteMethod" :disabled="activityItemFormData.id">
                <el-option v-for="item in other.activityArry" :key="item.id" :value="item.id"
                    :label="item.activity_title" />
            </el-select>
        </el-form-item>
        <el-form-item label="项目名称" prop="item_title">
            <el-input v-model="activityItemFormData.item_title" />
        </el-form-item>
        <el-form-item label="项目封面">
            <el-upload ref="upload" list-type="picture-card" v-model:file-list="uploadData.fileList" method="post"
                :action="`${getRequestAddress()}/api/sys/upload`" name="uploadFile" :data="uploadData.fileOther"
                :auto-upload="false" :limit="1" :on-exceed="handleExceed" :on-success="handleSuccess">
                <el-icon>
                    <Plus />
                </el-icon>
                <!-- 鼠标悬停工具栏（） -->
                <template #file="{ file }">
                    <div>
                        <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                    </div>
                </template>
            </el-upload>
        </el-form-item>
        <el-form-item label="项目介绍" prop="item_introduce">
            <el-input type="textarea" :rows="8" resize="none" v-model="activityItemFormData.item_introduce" />
        </el-form-item>
        <el-form-item label="项目票数">
            <el-input v-model="activityItemFormData.item_poll" disabled />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submit">保存</el-button>
            <el-button @click="emptyForm">清空</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, genFileId } from 'element-plus'
import { getImageUrl, getRequestAddress } from '@/utils/request';
import { findPollActivitys, getPollActivity } from '@/api/poll_activity';
import { createPollActivityItem, updatePollActivityItem } from "@/api/poll_activity_item";

export default {
    name: 'activityItemEditItem',
    props: ["activityItem"],
    setup(props) {
        let router = useRouter();

        let data = reactive({
            activityItemFormData: {
                item_title: null,
                item_introduce: null,
                item_image: '.png',
                item_poll: 0,
                activity_id: null,
                id: null
            },
            activityItemFormRules: {
                item_title: [{ required: true, message: "请填写标题" }],
                item_introduce: [{ required: true, message: "请填写介绍" }],
                activity_id: [{ required: true, message: "请搜索并选择活动" }],
            },
            uploadData: {
                fileList: [
                    { url: getImageUrl(".png") }
                ],
                fileOther: {
                    oldFileName: '.png',
                    path: '/img/activity_item/'
                }
            },
            other: {
                activityArry: [],
                isLoading: false
            }
        });

        let doms = {
            activityItemForm: ref(),
            upload: ref()
        }

        let eventCallBacks = {
            remoteMethod: async (searchStr) => {
                if (searchStr) {
                    data.other.activityArry.length = 0;
                    data.other.activityArry.push(...await findPollActivitys({ title: searchStr }));
                } else {
                    data.other.activityArry.length = 0;
                }
            },
            handleExceed(files) {
                doms.upload.value.clearFiles();
                const file = files[0];
                file.uid = genFileId();
                doms.upload.value.handleStart(file);
                // 更新 formData 的头像，仅用于判断更新，上传成功回调中会再次更新为新文件的名称
                data.activityItemFormData.item_image = file.name;
            },
            handleSuccess(response) {
                if (response.indexOf("失败") < 0) {
                    data.uploadData.fileOther.oldFileName = response;
                    data.activityItemFormData.item_image = response;
                    eventCallBacks.submit();
                } else {
                    ElMessage.error(response);
                }
            },
            submit() {
                doms.activityItemForm.value.validate(async valid => {
                    if (valid) {
                        data.other.isLoading = true;
                        // 判断是否需要上传头像
                        if (data.uploadData.fileOther.oldFileName == data.activityItemFormData.item_image) {
                            let response = false;
                            // 通过是否存在 id 判断 更新还是添加
                            if (!data.activityItemFormData.id)
                                response = await createPollActivityItem(data.activityItemFormData);
                            else
                                response = await updatePollActivityItem(data.activityItemFormData);
                            // 判断是否成功
                            if (response)
                                router.go(0);
                            else
                                ElMessage.error("保存失败，请刷新重写或联系管理员");
                        } else {
                            // 上传头像（上传成功会再次调用此函数）
                            doms.upload.value.submit();
                        }
                        data.other.isLoading = false;
                    }
                });
            },
            emptyForm() {
                doms.activityItemForm.value.resetFields();
            }
        }

        onMounted(async () => {
            if (props.activityItem) {
                Object.keys(props.activityItem).forEach(key => {
                    data.activityItemFormData[key] = props.activityItem[key];
                });
                data.other.activityArry.push(await getPollActivity(props.activityItem.activity_id));
                data.uploadData.fileOther.oldFileName = props.activityItem.item_image;
                data.uploadData.fileList[0].url = getImageUrl(props.activityItem.item_image);
            }
        });

        return {
            ...data,
            ...doms,
            ...eventCallBacks,
            getRequestAddress
        }
    }
}
</script>

<style scoped></style>