import { h, ref } from '../../lib/mini-vue.esm.js';

export const App = {
  setup () {
    const count = ref(0)

    const setCount = () => {
      count.value += 1
    }

    return {
      count,
      setCount
    }
  },
  render () {
    return h('div', {}, [
      h('div', {}, `count: ${this.count}`),
      h('button', { onClick: this.setCount }, `加一`),
    ])
  },
}
