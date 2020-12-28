// eslint-disable-next-line
import { remote } from 'electron'
export default {
  /* eslint no-param-reassign: "error" */
  install(Vue) {
    Vue.prototype.$electronStore = remote.getGlobal('electronStore')
  }
}
