import { proxyRefs } from "../reactivity"
import { shallowReadonly } from "../reactivity/reactive"
import { anyObjectType, instanceType, vnodeType } from "../types/index"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode: vnodeType, parentComponent: instanceType | null) {
  const component: instanceType = {
    vnode,
    type: vnode.type,
    el: null,
    proxy: null,
    setupState: {},
    render: () => { },
    props: {},
    emit: () => { },
    slots: {},
    provides: parentComponent ? parentComponent.provides : {},
    parent: parentComponent,
    isMounted: false,
    subTree: null,
  }

  component.emit = emit.bind(null, component)

  return component
}

export function setupComponent(instance: instanceType) {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)

  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: instanceType) {
  const component = instance.type
  const { setup } = component

  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

  if (setup) {
    const context = {
      emit: instance.emit
    }
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), context)
    setCurrentInstance(null)

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance: instanceType, setupResult: anyObjectType) {
  // TODO:
  // function

  // object
  if (typeof setupResult === 'object') {
    instance.setupState = proxyRefs(setupResult)
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: instanceType) {
  const component = instance.type

  instance.render = component.render
}

let currentInstance: instanceType | null = null
export const getCurrentInstance = () => {
  return currentInstance
};
export const setCurrentInstance = (instance: instanceType | null) => {
  currentInstance = instance
};

