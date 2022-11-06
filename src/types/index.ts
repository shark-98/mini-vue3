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
  shapeFlag: ShapeFlags
}
export type instanceType =
  { vnode: vnodeType }
  &
  Pick<vnodeType, 'type' | 'el'>
  &
  { proxy: any | null, setupState: anyObjectType, render: Function, props: anyObjectType }
