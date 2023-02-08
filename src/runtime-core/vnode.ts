import { isArray, isString } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { vnodeType } from "../types/index"

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");

export { createVNode as createElementVNode };

export function createVNode(type: any, props?: any, children?: any) {
  const vnode: vnodeType = {
    type,
    props,
    children,
    el: null,
    component: null,
    shapeFlag: getShapeFlag(type),
    key: props && props.key
  }

  if (isString(children)) {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }

  return vnode
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text);
}

const getShapeFlag = (type: any) => {
  return isString(type) ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
};
