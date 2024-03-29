<template>
  <main class="site-content" :class="{ 'site-content--tabs': $route.meta.isTab }">
    <!-- 主入口标签页 s -->
    <el-tabs v-if="$route.meta.isTab" v-model="mainTabsActiveName" :closable="true" @tab-click="handleSelectedTab" @tab-remove="handleRemoveTab">
      <el-dropdown class="site-tabs__tools" :show-timeout="0">
        <i class="el-icon-arrow-down el-icon--right" />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="handleTabsCloseCurrent">
            关闭当前标签页
          </el-dropdown-item>
          <el-dropdown-item @click.native="handleTabsCloseOther">
            关闭其它标签页
          </el-dropdown-item>
          <el-dropdown-item @click.native="handleTabsCloseAll">
            关闭全部标签页
          </el-dropdown-item>
          <el-dropdown-item @click.native="refresh()">
            刷新当前标签页
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-tab-pane v-for="item in mainTabs" :key="item.name" :label="item.title" :name="item.name">
        <el-card :body-style="siteContentViewHeight">
          <iframe v-if="item.type === 'iframe'" :src="item.iframeUrl" width="100%" height="100%" frameborder="0" scrolling="yes" />
          <keep-alive v-else>
            <router-view v-if="item.name === mainTabsActiveName" />
          </keep-alive>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    <!-- 主入口标签页 e -->
    <el-card v-else :body-style="siteContentViewHeight">
      <keep-alive>
        <router-view />
      </keep-alive>
    </el-card>
  </main>
</template>

<script>
import { isURL } from '@/utils/validate'

export default {
  inject: ['refresh'],
  data() {
    return {}
  },
  computed: {
    documentClientHeight: {
      get() {
        return this.$store.state.common.documentClientHeight
      }
    },
    menuActiveName: {
      get() {
        return this.$store.state.common.menuActiveName
      },
      set(val) {
        this.$store.commit('common/updateMenuActiveName', val)
      }
    },
    mainTabs: {
      get() {
        return this.$store.state.common.mainTabs
      },
      set(val) {
        this.$store.commit('common/updateMainTabs', val)
      }
    },
    mainTabsActiveName: {
      get() {
        return this.$store.state.common.mainTabsActiveName
      },
      set(val) {
        this.$store.commit('common/updateMainTabsActiveName', val)
      }
    },
    siteContentViewHeight() {
      let height = this.documentClientHeight - 50 - 30 - 2
      if (this.$route.meta.isTab) {
        height -= 40
        return isURL(this.$route.meta.iframeUrl)
          ? { height: `${height}px` }
          : { minHeight: `${height}px` }
      }
      return { minHeight: `${height}px` }
    }
  },
  methods: {
    // tabs, 选中tab
    handleSelectedTab(tab) {
      tab = this.mainTabs.filter((item) => item.name === tab.name)
      if (tab.length >= 1) {
        this.$router.push({
          name: tab[0].name,
          query: tab[0].query,
          params: tab[0].params
        })
      }
    },
    // tabs, 删除tab
    handleRemoveTab(tabName) {
      this.mainTabs = this.mainTabs.filter((item) => item.name !== tabName)
      if (this.mainTabs.length >= 1) {
        // 当前选中tab被删除
        if (tabName === this.mainTabsActiveName) {
          const tab = this.mainTabs[this.mainTabs.length - 1]
          this.$router.push(
            { name: tab.name, query: tab.query, params: tab.params },
            () => {
              this.mainTabsActiveName = this.$route.name
            }
          )
        }
      } else {
        this.menuActiveName = ''
        this.$router.push({ name: 'home' })
      }
    },
    // tabs, 关闭当前
    handleTabsCloseCurrent() {
      this.handleRemoveTab(this.mainTabsActiveName)
    },
    // tabs, 关闭其它
    handleTabsCloseOther() {
      this.mainTabs = this.mainTabs.filter(
        (item) => item.name === this.mainTabsActiveName
      )
    },
    // tabs, 关闭全部
    handleTabsCloseAll() {
      this.mainTabs = []
      this.menuActiveName = ''
      this.$router.push({ name: 'home' })
    },
    // tabs, 刷新当前
    handleTabsRefreshCurrent() {
      const tab = this.$route
      this.handleRemoveTab(tab.name)
      this.$nextTick(() => {
        this.$router.push({
          name: tab.name,
          query: tab.query,
          params: tab.params
        })
      })
    }
  }
}
</script>
