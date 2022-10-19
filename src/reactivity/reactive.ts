import { track, trigger } from "./effect"

export const reactive = (row: any) => {
  return new Proxy(row, {
    get(target, key) {
      const res = Reflect.get(target, key)

      // 依赖收集track
      track(target, key)
      return res
    },

    set(target, key, value) {
      const res = Reflect.set(target, key, value)

      // 依赖触发trigger
      trigger(target, key)
      return res
    }
  })
}
