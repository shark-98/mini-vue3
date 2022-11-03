import { anyObjectType, instanceType, vnodeType } from "../types/index"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode: vnodeType) {
  const component: instanceType = {
    vnode,
    type: vnode.type,
    el: null,
    proxy: null,
    setupState: {},
    render: () => { }
  }

  return component
}

export function setupComponent(instance: instanceType) {
  // TODO:
  // initProps()
  // initSlots()

  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: instanceType) {
  const component = instance.type
  const { setup } = component

  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

  if (setup) {
    const setupResult = setup()

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance: instanceType, setupResult: anyObjectType) {
  // TODO:
  // function

  // object
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: instanceType) {
  const component = instance.type

  instance.render = component.render
}

