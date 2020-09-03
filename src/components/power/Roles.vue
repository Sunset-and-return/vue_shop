<template>
  <div>
    <!-- 头部面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col :span="2">
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table border stripe :data="roleList">
        <!-- 展开列 expand -->
        <el-table-column type="expand" label="">
          <template slot-scope="scope">
            <el-row :class="['bd-bottom', index1 === 0 ? 'bd-top' : '', 'vcenter']"
              v-for="(item1, index1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>

              </el-col>
              <!-- 渲染二级或三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环嵌套渲染二级权限 -->
                <el-row :class="[index2 !== 0 ? 'bd-top' : '', 'vcenter']" v-for="(item2, index2) in item1.children"
                  :index="index2" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <el-col :span="18">
                    <el-tag v-for="(item3) in item2.children" :key="item3.id" type="warning" closable
                      @close="removeRightById(scope.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
            {{ scope.row }}
            </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除
            </el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>

    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="30%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item prop="roleName" label="角色名">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item prop="roleDesc" label="角色描述">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="30%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="ID">
          <el-input v-model="editForm.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item prop="roleName" label="角色名">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item prop="roleDesc" label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- 树形控件区域 -->
      <el-tree :data="rightsList" show-checkbox node-key='id' default-expand-all :props="defaultProps"
        :default-checked-keys="defKeys" ref="treeRef">
      </el-tree>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表数据
      roleList: [],
      // 控制添加角色对话框显示与隐藏
      addDialogVisible: false,
      // 控制添加角色对话框显示与隐藏
      editDialogVisible: false,
      // 控制分配权限对话框显示与隐藏
      setRightDialogVisible: false,
      // 权限列表
      rightsList: {},
      // 树形控件的属性绑定对象
      defaultProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点的 id 值
      defKeys: [],
      // 当前即将分配权限的角色的 id
      roleId: '',
      // 添加角色的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色的验证规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ]
      },
      // 编辑角色的表单数据
      editForm: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色的验证规则
      editFormRules: {
        roleName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
      this.roleList = res.data
      // console.log(this.roleList)
    },
    // 添加角色
    addRoles() {
      // 发起添加角色的请求
      this.$refs.addFormRef.validate(async vaild => {
        if (!vaild) return
        const { data: res } = await this.$http.post('roles', this.addForm)

        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getRolesList()
        this.$message.success('添加角色成功')
      })
    },
    // 编辑角色信息
    editRoleInfo() {
      this.$refs.editFormRef.validate(async vaild => {
        if (!vaild) return
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })

        if (res.meta.status !== 200) return this.$message.error('编辑角色失败')
        // 隐藏添加用户的对话框
        this.editDialogVisible = false
        // 重新获取用户列表数据
        this.getRolesList()
        this.$message.success('编辑角色成功')
      })
    },
    // 根据角色 id 删除角色
    async removeRoleById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      this.$message.success('删除角色成功！')
      this.getRolesList()
    },
    // 根据 id 删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否删除
      const confirmResult = await this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除角色权限失败')
      this.$message.success('删除角色信息成功！')
      // 不使用 this.getRolesList() 是为了防止页面重新渲染
      // 将服务器返回的权限列表数据直接赋值给当前权限列表
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('删除权限数据失败')
      this.rightsList = res.data
      // 递归获取三级节点的 id
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下三级权限的 id，并保存到数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }

      // for (var item in node.children) {
      //   this.getLeafKeys(node.children[item], arr)
      // }

      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRight() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      // console.log(idStr)

      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('角色授权失败！')

      this.$message.success('角色授权成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取角色信息失败！')
      this.editForm = res.data

      this.editDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px;
}

.bd-top {
  border-top: 1px solid #eee;
}

.bd-bottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
