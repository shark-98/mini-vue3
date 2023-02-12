import { h } from '../../dist/mini-vue.esm.js';
import { Foo } from "./Foo.js";

window.self = null;
export const App = {
  name: 'App',
  render () {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
        onClick: () => {
          console.log(`click`)
        },
        onMouseDown: () => {
          console.log(`mousedown`)
        },
      },
      [
        h("p", { class: "red" }, "hi"),
        h("p", { class: "blue" }, "mini-vue"),
        h('div', {}, `hello ${this.msg}`),
        h(Foo, {
          count: 1,
        }),
      ]
    );
  },
  setup () {
    return {
      msg: 'mini-vue'
    }
  }
}
