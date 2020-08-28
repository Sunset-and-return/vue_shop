import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home
    }
  ]
})

/**
 * 挂载路由导航守卫，to表示将要访问的路径，from表示从哪里来，next是下一个要做的操作
 * next() 放行
 * next('/xxx') 强制跳转到 xxx 页
 */
router.beforeEach((to, from, next) => {
  // ${//to and from are Route Object,next() must be called to resolve the hook}
  // 如果用户访问登录页,直接放行
  if (to.path === '/login') return next()
  // 从 sessionStorage 中获取保存的 token 值
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有 token 将强制跳转到登录页
  if (!tokenStr) return next('login')
  next()
})

export default router
