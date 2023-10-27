<template>
  <div v-loading.fullscreen.lock="loading" class="site-wrapper" :class="{ 'site-sidebar--fold': sidebarFold }" element-loading-text="拼命加载中">
    <template v-if="!loading">
      <main-navbar />
      <main-sidebar />
      <div class="site-content__wrapper" :style="{ 'min-height': documentClientHeight + 'px' }">
        <main-content v-if="!$store.state.common.contentIsNeedRefresh" />
      </div>
    </template>
  </div>
</template>

<script>
import MainNavbar from './main-navbar'
import MainSidebar from './main-sidebar'
import MainContent from './main-content'

export default {
  components: {
    MainNavbar,
    MainSidebar,
    MainContent
  },
  provide() {
    return {
      // 刷新
      refresh() {
        this.$store.commit('common/updateContentIsNeedRefresh', true)
        this.$nextTick(() => {
          this.$store.commit('common/updateContentIsNeedRefresh', false)
        })
      }
    }
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {
    documentClientHeight: {
      get() {
        return this.$store.state.common.documentClientHeight
      },
      set(val) {
        this.$store.commit('common/updateDocumentClientHeight', val)
      }
    },
    sidebarFold: {
      get() {
        return this.$store.state.common.sidebarFold
      }
    },
    userId: {
      get() {
        return this.$store.state.user.id
      }
    },
    userName: {
      get() {
        return this.$store.state.user.name
      }
    }
  },
  created() {},
  mounted() {
    this.resetDocumentClientHeight()
  },
  methods: {
    // 重置窗口可视高度
    resetDocumentClientHeight() {
      this.documentClientHeight = document.documentElement.clientHeight
      window.onresize = () => {
        this.documentClientHeight = document.documentElement.clientHeight
      }
    }
  }
}
</script>
