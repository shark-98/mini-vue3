import { isArray, isObject, isString } from "../shared/index";
import { anyObjectType, rootContainerType } from "../types/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode: any, container: rootContainerType) {
  patch(vnode, container)
}

function patch(vnode: any, container: rootContainerType) {
  const { type } = vnode;

  if (isString(type)) {
    processElement(vnode, container)
  } else if (isObject(type)) {
    processComponent(vnode, container)
  }
}

function processComponent(vnode: any, container: rootContainerType) {
  mountComponent(vnode, container)
}
function mountComponent(vnode: any, container: rootContainerType) {
  const instance = createComponentInstance(vnode)

  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function processElement(vnode: any, container: rootContainerType) {
  mountElement(vnode, container)
}
function mountElement(vnode: any, container: rootContainerType) {
  const { type, children, props } = vnode;
  const el = document.createElement(type);
  setElementProps(el, props);
  setElementChildren(el, children);

  (container as HTMLElement).append(el);
}
function setElementProps(el: HTMLElement, props: anyObjectType) {
  for (const p in props) {
    if (Object.prototype.hasOwnProperty.call(props, p)) {
      el.setAttribute(p, props[p])
    }
  }
}
function setElementChildren(el: HTMLElement, children: [] | string) {
  if (isString(children)) {
    el.innerText = children as string
  } else if (isArray(children)) {
    (children as []).forEach(v => patch(v, el))
  }
}

function setupRenderEffect(instance: any, container: rootContainerType) {
  const subTree = instance.render()

  // vnode -> patch
  patch(subTree, container)
}

