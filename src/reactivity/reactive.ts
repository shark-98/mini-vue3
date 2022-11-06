import { isObject } from "../shared/index";
import { anyObjectType } from "../types/index";
import { reactiveHandler, readonlyHandler, shallowReadonlyHandler } from "./baseHandlers"

function createReactiveObject(target: anyObjectType, handler: any) {
  if (!isObject(target)) {
    console.warn(`target ${target} 必须是一个对象`);
    return target
  }


  return new Proxy(target, handler);
}

export const reactive = (row: anyObjectType) => {
  return createReactiveObject(row, reactiveHandler);
}

export const readonly = (row: anyObjectType) => {
  return createReactiveObject(row, readonlyHandler);
}

export const shallowReadonly = (row: anyObjectType) => {
  return createReactiveObject(row, shallowReadonlyHandler);
}


export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

export const isReactive = (row: any) => {
  return !!row[ReactiveFlags.IS_REACTIVE]
}
export const isReadonly = (row: any) => {
  return !!row[ReactiveFlags.IS_READONLY]
}
export const isProxy = (row: any) => {
  return isReactive(row) || isReadonly(row)
}
