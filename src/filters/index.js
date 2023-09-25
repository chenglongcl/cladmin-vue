import Vue from 'vue'
Vue.filter('formatFileSize', (size) => {
  if (size < 1024) {
    return size.toFixed(0) + ' bytes'
  } else if (size < 1024 * 1024) {
    return (size / 1024.0).toFixed(0) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / 1024.0 / 1024.0).toFixed(1) + ' MB'
  } else {
    return (size / 1024.0 / 1024.0 / 1024.0).toFixed(1) + ' GB'
  }
})
