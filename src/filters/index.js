import Vue from 'vue'

Vue.filter('formatFileSize', (size) => {
  if (size < 1024) {
    return `${size.toFixed(0)} bytes`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024.0).toFixed(0)} KB`
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024.0 / 1024.0).toFixed(1)} MB`
  }
  return `${(size / 1024.0 / 1024.0 / 1024.0).toFixed(1)} GB`
})
