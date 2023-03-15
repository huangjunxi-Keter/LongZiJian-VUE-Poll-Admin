<template>
    <el-form v-loading="other.isLoading" ref="userForm" :model="userFormData" :rules="userFormRules" label-width="60">
        <el-row>
            <el-col :span="13">
                <el-form-item label="头像">
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
            <el-col :span="11">
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userFormData.email" />
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="userFormData.nickname" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="userFormData.password" />
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="8">
                <el-form-item label="类型" prop="type">
                    <el-select v-model="userFormData.type" placeholder="请选择类型">
                        <el-option label="管理员" :value="0" />
                        <el-option label="用户" :value="1" />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="状态" prop="state">
                    <el-select v-model="userFormData.state" placeholder="请选择状态">
                        <el-option label="启用" :value="0" />
                        <el-option label="停用" :value="1" />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item>
                    <el-button type="primary" @click="submit">保存</el-button>
                    <el-button @click="emptyForm">清空</el-button>
                </el-form-item>
            </el-col>
        </el-row>
    </el-form>
</template>

<script>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, genFileId } from 'element-plus'
import { getImageUrl, getRequestAddress } from '@/utils/request';
import { updateUser, createUser, getUserDataByEmail } from "@/api/user";

export default {
    name: 'UserEdit',
    props: ["user"],
    setup(props) {
        let router = useRouter();

        let data = reactive({
            userFormData: {
                email: null,
                nickname: null,
                password: null,
                avatar: '.png',
                state: null,
                type: null,
                id: null
            },
            userFormRules: {
                email: [{ required: true, message: "邮箱不能为空", trigger: 'blur' }, { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
                nickname: [{ required: true, message: "昵称不能为空", trigger: 'blur' }],
                password: [{ required: true, message: "密码不能为空", trigger: 'blur' }],
                state: [{ required: true, message: "请选择用户状态" }],
                type: [{ required: true, message: "请选择用户类型" }],
            },
            uploadData: {
                fileList: [
                    { url: getImageUrl(".png") }
                ],
                fileOther: {
                    oldFileName: '.png',
                    path: '/img/user/'
                }
            },
            other: {
                isLoading: false
            }
        });

        let doms = {
            userForm: ref(),
            upload: ref()
        }

        let eventCallBacks = {
            handleExceed(files) {
                doms.upload.value.clearFiles();
                const file = files[0];
                file.uid = genFileId();
                doms.upload.value.handleStart(file);
                // 更新 formData 的头像，仅用于判断更新，上传成功回调中会再次更新为新文件的名称
                data.userFormData.avatar = file.name;
            },
            handleSuccess(response) {
                if (response.indexOf("失败") < 0) {
                    data.uploadData.fileOther.oldFileName = response;
                    data.userFormData.avatar = response;
                    eventCallBacks.submit();
                } else {
                    ElMessage.error(response);
                }
            },
            submit() {
                doms.userForm.value.validate(async valid => {
                    if (valid) {
                        data.other.isLoading = true;
                        // 判断是否需要上传头像
                        if (data.uploadData.fileOther.oldFileName == data.userFormData.avatar) {
                            let response = false;
                            // 通过是否存在 id 判断 更新还是添加
                            if (!data.userFormData.id) {
                                let hasEmail = await getUserDataByEmail(data.userFormData.email);
                                // 判断数据库是否存在邮箱
                                if (hasEmail)
                                    ElMessage.error("邮箱已存在");
                                else
                                    response = await createUser(data.userFormData);
                            }
                            else
                                response = await updateUser(data.userFormData);
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
                doms.userForm.value.resetFields();
            }
        }

        onMounted(() => {
            if (props.user) {
                Object.keys(props.user).forEach(key => {
                    data.userFormData[key] = props.user[key];
                });
                data.uploadData.fileOther.oldFileName = props.user.avatar;
                data.uploadData.fileList[0].url = getImageUrl(props.user.avatar);
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