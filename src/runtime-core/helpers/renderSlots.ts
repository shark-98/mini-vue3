import { isFunction } from "../../shared/index";
import { createVNode, Fragment } from "../vnode";

export const renderSlots = (slots: any, name: string, props: any) => {
  const slot = slots[name];
  if (slot) {
    if (isFunction(slot)) {
      return createVNode(Fragment, {}, slot(props))
    }
  }
};
