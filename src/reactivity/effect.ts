import { extend } from "../shared"

class ReactiveEffect {
  private _fn
  deps: Array<any> = []
  active: boolean = true
  onStop?: () => void

  constructor(fn: Function, public scheduler?: Function) {
    this._fn = fn
  }

  run() {
    activeEffect = this
    return this._fn()
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)

      this.onStop?.()

      this.active = false
    }
  }
}

const cleanupEffect = (effect: ReactiveEffect) => {
  effect.deps.forEach((dep) => {
    dep.delete(effect)
  })
}

let activeEffect: ReactiveEffect
const targetMap = new Map()

export const track = (target: any, key: any) => {
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

  if (activeEffect) {
    deps.add(activeEffect)
    activeEffect.deps.push(deps)
  }

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
