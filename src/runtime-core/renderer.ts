import { isArray, isObject, isString } from "../shared/index";
import { anyObjectType, instanceType, rootContainerType, vnodeType } from "../types/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode: vnodeType, container: rootContainerType) {
  patch(vnode, container)
}

function patch(vnode: vnodeType, container: rootContainerType) {
  const { type } = vnode;

  if (isString(type)) {
    processElement(vnode, container)
  } else if (isObject(type)) {
    processComponent(vnode, container)
  }
}

function processComponent(vnode: vnodeType, container: rootContainerType) {
  mountComponent(vnode, container)
}
function mountComponent(initialVNode: vnodeType, container: rootContainerType) {
  const instance = createComponentInstance(initialVNode)

  setupComponent(instance)
  setupRenderEffect(instance, initialVNode, container)
}

function processElement(vnode: vnodeType, container: rootContainerType) {
  mountElement(vnode, container)
}
function mountElement(vnode: vnodeType, container: rootContainerType) {
  const { type, children, props } = vnode;
  const el = vnode.el = document.createElement(type);
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

function setupRenderEffect(instance: instanceType, initialVNode: vnodeType, container: rootContainerType) {
  const subTree = instance.render.call(instance.proxy)

  // vnode -> patch
  patch(subTree, container)

  initialVNode.el = subTree.el
}

