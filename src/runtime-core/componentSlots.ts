import { isArray } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { instanceType } from "../types/index";

export const initSlots = (instance: instanceType, children: any) => {
  const { vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(instance.slots, children)
  }
};

function normalizeObjectSlots(slots: any, children: any) {
  for (const key in children) {
    const value = children[key]
    slots[key] = (props: any) => normalizeSlotValue(value(props))
  }
}
function normalizeSlotValue(value: any) {
  return isArray(value) ? value : [value];
}
