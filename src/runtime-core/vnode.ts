import { isArray, isString } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { vnodeType } from "../types/index"

export function createVNode(type: any, props?: any, children?: any) {
  const vnode: vnodeType = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type)
  }

  if (isString(children)) {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  return vnode
}

const getShapeFlag = (type: any) => {
  return isString(type) ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
};
