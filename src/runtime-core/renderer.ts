import { rootContainerType } from "../types";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode: any, container: rootContainerType) {
  patch(vnode, container)
}

function patch(vnode: any, container: rootContainerType) {
  processComponent(vnode, container)
}

function processComponent(vnode: any, container: rootContainerType) {
  mountComponent(vnode, container)
}

function mountComponent(vnode: any, container: rootContainerType) {
  const instance = createComponentInstance(vnode)

  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance: any, container: rootContainerType) {
  const subTree = instance.render()

  // vnode -> patch

  patch(subTree, container)
}

