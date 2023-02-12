import { rootContainerType } from "@mini-vue/types"
import { createVNode } from "./vnode"

export function createAppAPI(render: Function) {
  return function createApp(rootComponent: any) {
    return {
      mount(rootContainer: rootContainerType) {
        // component -> vnode
        const vnode = createVNode(rootComponent)

        render(vnode, rootContainer)
      }
    }
  }
}


