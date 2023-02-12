import { isArray, ShapeFlags } from "@mini-vue/shared";
import { instanceType } from "@mini-vue/types";

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
