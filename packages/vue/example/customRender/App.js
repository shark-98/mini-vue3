import { h } from '../../dist/mini-vue.esm.js';

export const App = {
  setup () {
    return {
      x: 100,
      y: 200
    }
  },
  render () {
    return h('rect', { x: this.x, y: this.y })
  }
}
