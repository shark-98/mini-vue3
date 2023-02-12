import { extend, isObject } from "@mini-vue/shared"
import { anyObjectType } from "@mini-vue/types"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"

function createGetter(isReadonly = false, shallow = false) {
  return (target: anyObjectType, key: string) => {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    }
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const res = Reflect.get(target, key)

    if (shallow) {
      return res
    }

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
  return (target: anyObjectType, key: string, value: any) => {
    const res = Reflect.set(target, key, value)

    // 依赖触发trigger
    trigger(target, key)
    return res
  }

}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

export const reactiveHandler = {
  get,
  set
}
export const readonlyHandler = {
  get: readonlyGet,
  set(target: anyObjectType, key: string) {
    console.warn(`key: ${key} set Error, because target is readonly`)
    return true
  }
}
export const shallowReadonlyHandler = extend({}, readonlyHandler, { get: shallowReadonlyGet })
