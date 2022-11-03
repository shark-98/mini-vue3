import { anyObjectType } from "../types/index";
import { createVNode } from "./vnode";

export function h(type: anyObjectType, props?: anyObjectType, children?: anyObjectType) {
  return createVNode(type, props, children)
}
