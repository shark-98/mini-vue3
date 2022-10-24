import { reactiveHandler, readonlyHandler, shallowReadonlyHandler } from "./baseHandlers"

function createReactiveObject(target: any, handler: any) {
  return new Proxy(target, handler);
}

export const reactive = (row: any) => {
  return createReactiveObject(row, reactiveHandler);
}

export const readonly = (row: any) => {
  return createReactiveObject(row, readonlyHandler);
}

export const shallowReadonly = (row: any) => {
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
