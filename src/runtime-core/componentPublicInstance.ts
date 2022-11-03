import { anyObjectType } from "../types/index"

const publicPropertiesMap: anyObjectType = {
  '$el': (i: any) => i.vnode.el
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }: anyObjectType, key: any) {
    const { setupState } = instance
    if (key in setupState) {
      return setupState[key]
    }

    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}
