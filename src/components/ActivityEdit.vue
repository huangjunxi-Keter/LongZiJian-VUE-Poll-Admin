<template>
    <el-form v-loading="other.isLoading" ref="activityForm" :model="activityFormData" :rules="activityFormRules"
        label-width="60">
        <el-form-item label="标题" prop="activity_title">
            <el-input v-model="activityFormData.activity_title" />
        </el-form-item>
        <el-row>
            <el-col :span="12">
                <el-form-item label="封面">
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
            </el-col>
            <el-col :span="12">
                <el-form-item label="总票数">
                    <el-input v-model="activityFormData.poll_count" disabled />
                </el-form-item>
                <el-form-item label="项目数">
                    <el-input v-model="activityFormData.item_count" disabled />
                </el-form-item>
                <el-form-item label="浏览量">
                    <el-input v-model="activityFormData.page_view" disabled />
                </el-form-item>
            </el-col>
        </el-row>
        <el-form-item label="介绍" prop="activity_introduce">
            <el-input type="textarea" :rows="8" resize="none" v-model="activityFormData.activity_introduce" />
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
import { useStore } from 'vuex';
import { ElMessage, genFileId } from 'element-plus'
import { getImageUrl, getRequestAddress } from '@/utils/request';
import { createPollActivity, updatePollActivity } from "@/api/poll_activity";

export default {
    name: 'ActivityEdit',
    props: ["activity"],
    setup(props) {
        let router = useRouter();
        let store = useStore();

        let data = reactive({
            activityFormData: {
                activity_title: null,
                activity_introduce: null,
                poll_count: 0,
                item_count: 0,
                page_view: 0,
                cover_image: '.png',
                user_id: store.state.user.loginUser.id,
                id: null
            },
            activityFormRules: {
                activity_title: [{ required: true, message: "请填写标题" }],
                activity_introduce: [{ required: true, message: "请填写介绍" }]
            },
            uploadData: {
                fileList: [
                    { url: getImageUrl(".png") }
                ],
                fileOther: {
                    oldFileName: '.png',
                    path: '/img/activity/'
                }
            },
            other: {
                isLoading: false
            }
        });

        let doms = {
            activityForm: ref(),
            upload: ref()
        }

        let eventCallBacks = {
            handleExceed(files) {
                doms.upload.value.clearFiles();
                const file = files[0];
                file.uid = genFileId();
                doms.upload.value.handleStart(file);
                // 更新 formData 的头像，仅用于判断更新，上传成功回调中会再次更新为新文件的名称
                data.activityFormData.cover_image = file.name;
            },
            handleSuccess(response) {
                if (response.indexOf("失败") < 0) {
                    data.uploadData.fileOther.oldFileName = response;
                    data.activityFormData.cover_image = response;
                    eventCallBacks.submit();
                } else {
                    ElMessage.error(response);
                }
            },
            submit() {
                doms.activityForm.value.validate(async valid => {
                    if (valid) {
                        data.other.isLoading = true;
                        // 判断是否需要上传头像
                        if (data.uploadData.fileOther.oldFileName == data.activityFormData.cover_image) {
                            let response = false;
                            // 通过是否存在 id 判断 更新还是添加
                            if (!data.activityFormData.id)
                                response = await createPollActivity(data.activityFormData);
                            else
                                response = await updatePollActivity(data.activityFormData);
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
                doms.activityForm.value.resetFields();
            }
        }

        onMounted(() => {
            if (props.activity) {
                Object.keys(props.activity).forEach(key => {
                    data.activityFormData[key] = props.activity[key];
                });
                data.uploadData.fileOther.oldFileName = props.activity.cover_image;
                data.uploadData.fileList[0].url = getImageUrl(props.activity.cover_image);
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