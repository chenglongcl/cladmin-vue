<template>
  <div>
    <tinymce-editor
      ref="tinymceEditor"
      v-model="contentData"
      :tinymce-script-src="localSrc"
      v-bind="$attrs"
      :init="{
        ...{
          height: height,
          menubar: false,
          language: 'zh_CN',
          draggable_modal: true,
          statusbar: true,
          object_resizing: false,
          image_caption:true,
          image_dimensions: false,
          image_uploadtab:false,
          paste_data_images: true
        },
        ...defaultOptions,
        ...options,
        setup,
        keep_styles: false,
        forced_root_block_attrs:{
          'style':'text-indent:2em'
        },
        extended_valid_elements : 'p/div,p[class|style],img[src|alt|title|file-unique-id],video[src|poster|controls|file-unique-id|webkit-playsinline|x-webkit-airplay|playsinline|x5-video-player-type|x5-video-player-fullscreen],audio[src|controls|file-unique-id]',
        formats:{
            alignleft: {block:'p',styles:{'text-align':'left'}},
            aligncenter: {block:'p',styles:{'text-align':'center','text-indent':'0em'}},
            alignright: {block:'p',styles:{'text-align':'right','text-indent':'0em'}},
        },
        paste_postprocess
      }"
      v-on="$listeners"
    />
    <!-- 弹窗, 上传文件 -->
    <UploaderOSS v-if="uploaderVisible" ref="uploaderOSS" :limit="uploaderLimit" :input-attrs="uploaderInputAtrrs" @on-success-files="handleSuccessFiles($event,uploaderExtra)" @on-fail-files="handleFailFiles($event,uploaderExtra)" />
  </div>

</template>

<script>
import Editor from '@tinymce/tinymce-vue'
import { richTextEditorOptions } from './defaultOptions'
import UploaderOSS from '@/components/upload/uploader-oss'
export default {
  name: 'RichTextEditor',
  components: {
    tinymceEditor: Editor,
    UploaderOSS
  },
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ''
    },
    height: {
      type: [Number, String],
      default: 400
    },
    options: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      uploaderVisible: false,
      uploaderInputAtrrs: {
        accept: '*'
      },
      uploaderLimit: 0,
      uploaderExtra: {},
      currEditorSelectionID: '',
      contentData: '',
      localSrc: `${
        process.env.NODE_ENV === 'production'
          ? window.SITE_CONFIG['version']
          : ''
      }/static/tinymce/tinymce.min.js`,
      defaultOptions: richTextEditorOptions,
      setup: (editor) => {
        editor.ui.registry.addButton('uploadimg', {
          tooltip: '上传图片',
          icon: 'image',
          onAction: () => {
            this.changUploaderConfig({
              uploaderInputAtrrs: {
                accept: 'image/*'
              },
              uploaderLimit: 0,
              uploaderExtra: {
                type: 'uploadimg'
              }
            })
            this.uploaderVisible = true
            this.$nextTick(() => {
              this.$refs.uploaderOSS.init()
            })
          }
        })
        editor.ui.registry.addButton('uploadvideo', {
          tooltip: '上传音视频',
          icon: 'embed',
          onAction: () => {
            this.changUploaderConfig({
              uploaderInputAtrrs: {
                accept: 'video/*,audio/*'
              },
              uploaderLimit: 0,
              uploaderExtra: {
                type: 'uploadvideo'
              }
            })
            this.uploaderVisible = true
            this.$nextTick(() => {
              this.$refs.uploaderOSS.init()
            })
          }
        })
        editor.ui.registry.addButton('uploaddocument', {
          tooltip: '上传文档',
          icon: 'upload',
          onAction: () => {
            this.changUploaderConfig({
              uploaderInputAtrrs: {
                accept: 'application/*'
              },
              uploaderLimit: 0,
              uploaderExtra: {
                type: 'uploaddocument'
              }
            })
            this.uploaderVisible = true
            this.$nextTick(() => {
              this.$refs.uploaderOSS.init()
            })
          }
        })
        editor.ui.registry.addButton('replaceuploadimg', {
          tooltip: '替换图片',
          icon: 'image',
          onAction: () => {
            this.changUploaderConfig({
              uploaderInputAtrrs: {
                accept: 'image/*'
              },
              uploaderExtra: {
                type: 'replaceuploadimg'
              },
              uploaderLimit: 1
            })
            this.uploaderVisible = true
            this.$nextTick(() => {
              this.$refs.uploaderOSS.init()
            })
          }
        })
        editor.ui.registry.addContextToolbar('replaceimg', {
          predicate: (node) => {
            const ok =
              node.nodeName.toLowerCase() === 'img' ||
              (node.nodeName.toLowerCase() === 'span' &&
                node.getAttribute('data-mce-object') === 'video')
            if (ok) {
              // 某些情况下，选中会丢失，这里手动添加id
              const uniqueId = this.$refs.tinymceEditor.editor.dom.uniqueId()
              node.setAttribute('id', uniqueId)
              this.currEditorSelectionID = uniqueId
            }
            return ok
          },
          items: 'replaceuploadimg',
          position: 'node',
          scope: 'node'
        })
      },
      paste_postprocess(plugin, args) {
        const traverse = (parent, callback) => {
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i]
            if (callback) {
              callback(child)
            }
            traverse(child, callback)
          }
        }
        traverse(args.node, (element) => {
          element.removeAttribute('class')
          element.removeAttribute('style')
        })
        for (let i = 0; i < args.node.getElementsByTagName('p').length; i++) {
          const element = args.node.getElementsByTagName('p')[i]
          element.innerHTML = element.innerHTML.trim()
          element.removeAttribute('style')
          element.style.textIndent = '2em'
          if (
            element.hasChildNodes() &&
            ['img'].indexOf(element.childNodes[0].nodeName.toLowerCase()) > -1
          ) {
            element.style.textIndent = '0em'
            element.style.textAlign = 'center'
          }
        }
      }
    }
  },
  watch: {
    value: {
      handler: function(value) {
        this.contentData = value
      },
      immediate: true
    }
  },
  methods: {
    changUploaderConfig(config) {
      config = config || {}
      this.uploaderInputAtrrs =
        config.uploaderInputAtrrs || this.uploaderInputAtrrs
      this.uploaderLimit = config.uploaderLimit || 0
      this.uploaderExtra = config.uploaderExtra || {}
    },
    // 上传成功
    handleSuccessFiles(files, extra) {
      switch (extra.type) {
        case 'uploadimg':
        case 'uploadvideo': {
          files.forEach((file, index, arr) => {
            switch (file.contentType.split('/')[0]) {
              case 'image':
                this.$refs.tinymceEditor.editor.insertContent(
                  `<p style="text-align: center; text-indent: 0em;"><img file-unique-id="${file.fileUniqueId}" src="${file.url}" /></p>`
                )
                break
              case 'video':
                this.$refs.tinymceEditor.editor.insertContent(
                  `<p style="text-align: center; text-indent: 0em;"><video file-unique-id="${file.fileUniqueId}" src="${file.url}" controls="controls"></video></p>`
                )
                break
              case 'audio':
                this.$refs.tinymceEditor.editor.insertContent(
                  `<p style="text-align: center; text-indent: 0em;"><audio file-unique-id="${file.fileUniqueId}" src="${file.url}" controls="controls"></audio></p>`
                )
                break
              default:
                break
            }
          })
          break
        }
        case 'uploaddocument': {
          files.forEach((file, index, arr) => {
            this.$refs.tinymceEditor.editor.insertContent(
              `<a id="${file.fileUniqueId}" href="${file.url}" target="_blank">${file.fileName}</a>`
            )
          })
          break
        }
        case 'replaceuploadimg': {
          // 某些情况下，选中会丢失，通过ID重新获取
          const element = this.$refs.tinymceEditor.editor.dom.get(
            this.currEditorSelectionID
          )
          this.$refs.tinymceEditor.editor.selection.select(element)
          const editorSelection = this.$refs.tinymceEditor.editor.selection
          // 替换图片
          if (editorSelection.getNode().nodeName.toLowerCase() === 'img') {
            const imgAttrs = {}
            const attrs =
              this.$refs.tinymceEditor.editor.dom.getAttribs(element)
            Object.keys(attrs).forEach((key) => {
              if (!/^data-mce-.+$/.test(attrs[key].name)) {
                imgAttrs[attrs[key].name] = attrs[key].value
              }
            })
            editorSelection.setNode(
              this.$refs.tinymceEditor.editor.dom.create(
                'img',
                Object.assign(imgAttrs, {
                  src: files[0].url,
                  'file-unique-id': files[0].fileUniqueId
                })
              )
            )
            this.$refs.tinymceEditor.editor.selection.select(
              editorSelection.getNode().getElementsByTagName('img')[0]
            )
          }
          // 替换视频封面图
          if (
            editorSelection.getNode().nodeName.toLowerCase() === 'span' &&
            editorSelection.getNode().getAttribute('data-mce-object') ===
              'video'
          ) {
            const videoAttrs = {}
            const videoElement = editorSelection
              .getNode()
              .getElementsByTagName('video')[0]
            if (videoElement) {
              const attrs = videoElement.attributes
              Object.keys(attrs).forEach((key) => {
                videoAttrs[attrs[key].name] = attrs[key].value
              })
              editorSelection.setNode(
                this.$refs.tinymceEditor.editor.dom.create(
                  'video',
                  Object.assign(videoAttrs, {
                    poster: files[0].url,
                    'file-unique-id': editorSelection
                      .getNode()
                      .getAttribute('data-mce-p-file-unique-id')
                  })
                )
              )
            }
          }
          break
        }
        default:
          break
      }
      console.log('上传成功的文件', files)
    },
    // 上传失败
    handleFailFiles(files) {
      console.log('上传失败的文件', files)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
