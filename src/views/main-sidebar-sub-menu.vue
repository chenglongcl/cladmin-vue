<template>
  <el-submenu v-if="menu.children && menu.children.length >= 1" :index="menu.menuId + ''" :popper-class="'site-sidebar--' + sidebarLayoutSkin + '-popper'">
    <template slot="title">
      <icon-svg :name="menu.icon || ''" class="site-sidebar__menu-icon" />
      <span>{{ menu.name }}</span>
    </template>
    <sub-menu v-for="item in menu.children" :key="item.menuId" :menu="item" :dynamic-menu-routes="dynamicMenuRoutes" />
  </el-submenu>
  <el-menu-item v-else :index="menu.menuId + ''" @click="handleGotoRoute(menu)">
    <icon-svg :name="menu.icon || ''" class="site-sidebar__menu-icon" />
    <span>{{ menu.name }}</span>
  </el-menu-item>
</template>

<script>
import SubMenu from './main-sidebar-sub-menu'

export default {
  name: 'SubMenu',
  components: {
    SubMenu
  },
  props: {
    menu: {
      type: Object,
      required: true
    },
    dynamicMenuRoutes: {
      type: Array,
      required: true
    }
  },
  computed: {
    sidebarLayoutSkin: {
      get() {
        return this.$store.state.common.sidebarLayoutSkin
      }
    }
  },
  methods: {
    // 通过menuId与动态(菜单)路由进行匹配跳转至指定路由
    handleGotoRoute(menu) {
      const route = this.dynamicMenuRoutes.filter(
        (item) => item.meta.menuId === menu.menuId
      )
      if (route.length >= 1) {
        this.$router.push({ name: route[0].name })
      }
    }
  }
}
</script>
