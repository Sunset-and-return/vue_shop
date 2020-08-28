<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$message.success('成功退出')
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped></style>
