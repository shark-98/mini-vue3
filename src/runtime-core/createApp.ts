import { rootContainerType } from "../types"
import { render } from "./renderer"
import { createVNode } from "./vnode"

export function createApp(rootComponent: any) {
  return {
    mount(rootContainer: rootContainerType) {
      // component -> vnode
      const vnode = createVNode(rootComponent)

      render(vnode, rootContainer)
    }
  }
}


