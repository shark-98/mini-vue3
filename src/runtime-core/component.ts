import { shallowReadonly } from "../reactivity/reactive"
import { anyObjectType, instanceType, vnodeType } from "../types/index"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode: vnodeType) {
  const component: instanceType = {
    vnode,
    type: vnode.type,
    el: null,
    proxy: null,
    setupState: {},
    render: () => { },
    props: {},
    emit: () => { },
    slots: {}
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
    const setupResult = setup(shallowReadonly(instance.props), context)

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

