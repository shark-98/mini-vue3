import { ReactiveEffect } from "../reactivity/effect"
import { ShapeFlags } from "../shared/ShapeFlags"

export type rootContainerType = String | HTMLElement
export type anyObjectType = { [key: string]: any }
export type effectDepsType = Set<ReactiveEffect>
export type vnodeType = {
  type: any,
  props: anyObjectType,
  children: [] | string,
  el: HTMLElement | null,
  shapeFlag: ShapeFlags,
  key: any,
}
export type instanceType =
  { vnode: vnodeType }
  &
  Pick<vnodeType, 'type' | 'el'>
  &
  { proxy: any | null, setupState: anyObjectType, render: Function, props: anyObjectType, emit: Function, slots: anyObjectType, provides: any, parent: instanceType | null, isMounted: boolean, subTree: vnodeType | null }
export type renderType = {
  createElement: (type: any) => any,
  patchProp: (el: any, key: any, oldVal: any, newVal: any) => void,
  insert: (child: any, parent: any, anchor: HTMLElement | null) => void,
  remove: (child: any) => void,
  setElementText: (el: HTMLElement, text: string) => void,
}
