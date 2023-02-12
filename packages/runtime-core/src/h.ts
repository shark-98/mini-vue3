import { anyObjectType } from "@mini-vue/types";
import { createVNode } from "./vnode";

export function h(type: anyObjectType, props?: anyObjectType, children?: anyObjectType) {
  return createVNode(type, props, children)
}
