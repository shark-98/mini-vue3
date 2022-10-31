export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type
  }

  return component
}

export function setupComponent(instance: any) {
  // TODO:
  // initProps()
  // initSlots()

  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const component = instance.type
  const { setup } = component
  if (setup) {
    const setupResult = setup()

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance: any, setupResult: any) {
  // TODO:
  // function

  // object
  if (typeof setupResult === 'object') {
    instance.setupResult = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const component = instance.type
  if (component.render) {
    instance.render = component.render
  }
}

