import { isObject } from "../shared"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"

function createGetter(isReadonly = false) {
  return (target: any, key: any) => {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    }
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const res = Reflect.get(target, key)

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    if (!isReadonly) {
      // 依赖收集track
      track(target, key)
    }

    return res
  }
}

function createSetter() {
  return (target: any, key: any, value: any) => {
    const res = Reflect.set(target, key, value)

    // 依赖触发trigger
    trigger(target, key)
    return res
  }

}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

export const reactiveHandler = {
  get,
  set
}
export const readonlyHandler = {
  get: readonlyGet,
  set(target: any, key: any) {
    console.warn(`key: ${key} set Error, because target is readonly`)
    return true
  }
}
