import { vnodeType } from "../types/index"

export function createVNode(type: any, props?: any, children?: any) {
  const vnode: vnodeType = {
    type,
    props,
    children,
    el: null
  }

  return vnode
}
