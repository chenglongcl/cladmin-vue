<template>
  <svg :class="getClassName" :width="width" :height="height" aria-hidden="true">
    <use :xlink:href="getName" />
  </svg>
</template>

<script>
export default {
  name: 'IconSvg',
  props: {
    name: {
      type: String,
      required: true
    },
    // eslint-disable-next-line
    className: {
      type: String
    },
    // eslint-disable-next-line
    width: {
      type: String
    },
    // eslint-disable-next-line
    height: {
      type: String
    }
  },
  computed: {
    getName() {
      return `#icon-${this.name}`
    },
    getClassName() {
      return [
        'icon-svg',
        `icon-svg__${this.name}`,
        this.className && /\S/.test(this.className) ? `${this.className}` : ''
      ]
    }
  }
}
</script>

<style>
.icon-svg {
  width: 1em;
  height: 1em;
  fill: currentColor;
  overflow: hidden;
}
</style>
