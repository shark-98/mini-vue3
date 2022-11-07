import { hasOwn } from "../shared/index"
import { anyObjectType, instanceType } from "../types/index"

const publicPropertiesMap: anyObjectType = {
  '$el': (i: instanceType) => i.vnode.el,
  '$slots': (i: instanceType) => i.slots
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }: anyObjectType, key: string) {
    const { setupState, props } = instance
    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props, key)) {
      return props[key]
    }

    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}
