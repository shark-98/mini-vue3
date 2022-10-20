class ReactiveEffect {
  private _fn

  constructor(fn: Function) {
    this._fn = fn
  }

  run() {
    activeEffect = this
    return this._fn()
  }
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

  deps.add(activeEffect)
}
export const trigger = (target: any, key: any) => {
  const targetDep = targetMap.get(target)
  const deps = targetDep.get(key)
  for (const dep of deps) {
    dep.run()
  }
}

export const effect = (fn: Function) => {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
  return _effect.run.bind(_effect)
}
