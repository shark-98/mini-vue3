import { h } from "../../dist/mini-vue.esm.js";

export const Foo = {
  setup (props) {
    // props.count
    console.log(props);

    // shallow readonly
    props.count++
    console.log(props);
  },
  render () {
    return h("div", {}, "foo: " + this.count);
  },
};
