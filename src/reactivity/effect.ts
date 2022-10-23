import { extend } from "../shared"

let activeEffect: ReactiveEffect
let shouldTrack: boolean = false
const targetMap = new Map()

class ReactiveEffect {
  private _fn
  deps: Array<any> = []
  active: boolean = true
  onStop?: () => void

  constructor(fn: Function, public scheduler?: Function) {
    this._fn = fn
  }

  run() {
    if (!this.active) {
      return this._fn()
    }

    // 应该收集
    shouldTrack = true
    activeEffect = this
    const res = this._fn()
    // 重置
    shouldTrack = false

    return res
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)

      this.onStop?.()

      this.active = false
      shouldTrack = false
    }
  }
}

const cleanupEffect = (effect: ReactiveEffect) => {
  effect.deps.forEach((dep) => {
    dep.delete(effect)
  })

  // 把 effect.deps 清空
  effect.deps.length = 0
}

const isTracking = () => {
  return shouldTrack && activeEffect !== undefined
}

export const track = (target: any, key: any) => {
  if (!isTracking()) return

  let targetDep = targetMap.get(target)
  if (!targetDep) {
    targetDep = new Map()
    targetMap.set(target, targetDep)
  }

  let deps = targetDep.get(key)
  if (!deps) {
    deps = new Set()
    targetDep.set(key, deps)
  }

  // 看看 dep 之前有没有添加过，添加过的话 那么就不添加了
  if (deps.has(activeEffect)) return

  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}
export const trigger = (target: any, key: any) => {
  const targetDep = targetMap.get(target)
  const deps = targetDep.get(key)
  for (const dep of deps) {
    if (dep.scheduler) {
      dep.scheduler()
    } else {
      dep.run()
    }
  }
}

export const effect = (fn: Function, options: any = {}) => {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  extend(_effect, options)
  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  runner._effect = _effect
  return runner
}
export const stop = (runner: any) => {
  runner._effect.stop()
}
