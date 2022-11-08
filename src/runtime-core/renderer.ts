import { ShapeFlags } from "../shared/ShapeFlags";
import { anyObjectType, instanceType, rootContainerType, vnodeType } from "../types/index";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode: vnodeType, container: rootContainerType) {
  patch(vnode, container)
}

function patch(vnode: vnodeType, container: rootContainerType) {
  const { type, shapeFlag } = vnode;

  switch (type) {
    case Fragment:
      processFragment(vnode, container);
      break;
    case Text:
      processText(vnode, container);
      break;

    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
      }
      break;
  }
}

function processText(vnode: any, container: any) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}

function processFragment(vnode: any, container: any) {
  mountChildren(vnode, container);
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
  setElementChildren(vnode, el, children);

  (container as HTMLElement).append(el);
}
function mountChildren(vnode: vnodeType, container: rootContainerType) {
  (vnode.children as []).forEach(v => patch(v, container))
}
function setElementProps(el: HTMLElement, props: anyObjectType) {
  for (const key in props) {
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      const val = props[key]
      const isOn = (name: string) => /^on[A-Z]/.test(name)
      if (isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase()
        el.addEventListener(event, val)
      } else {
        el.setAttribute(key, val)
      }
    }
  }
}
function setElementChildren(vnode: vnodeType, el: HTMLElement, children: [] | string) {
  if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.innerText = children as string
  } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el)
  }
}

function setupRenderEffect(instance: instanceType, initialVNode: vnodeType, container: rootContainerType) {
  const subTree = instance.render.call(instance.proxy)

  // vnode -> patch
  patch(subTree, container)

  initialVNode.el = subTree.el
}

