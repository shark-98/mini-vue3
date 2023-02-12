import { h, provide, inject } from '../../dist/mini-vue.esm.js';

const Foo2 = {
  name: 'Foo2',
  setup () {
    const a = inject('a')
    const b = inject('b')
    const x = inject('x')
    const y = inject('y', () => 'yyy')
    const z = inject('z', 'zzz')

    return {
      a, b, x, y, z
    }
  },
  render () {
    return h('div', {},
      [
        h('div', {}, 'Foo2'),
        h('div', {}, `a: ${this.a}, b: ${this.b}, x: ${this.x}, y: ${this.y}, z: ${this.z}`)
      ]
    )
  }
}

const Foo1 = {
  name: 'Foo1',
  setup () {
    const a = inject('a')

    provide('a', 'hhh')
    provide('x', 'xxx')

    return { a }
  },
  render () {
    return h('div', {},
      [
        h('div', {}, `Foo1-a: ${this.a}`),
        h(Foo2)
      ]
    )
  }
}

const ProvideCom = {
  name: 'ProvideCom',
  setup () {
    provide('a', '1')
    provide('b', '2')
  },
  render () {
    return h('div', {},
      [
        h('div', {}, 'ProvideCom'),
        h(Foo1)
      ]
    )
  }
}

export default {
  name: 'App',
  setup () { },
  render () {
    return h("div", {},
      [
        h("p", {}, "apiInject"),
        h(ProvideCom)
      ]
    );
  },
}
