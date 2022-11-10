import { ShapeFlags } from "../shared/ShapeFlags";
import { anyObjectType, instanceType, rootContainerType, vnodeType } from "../types/index";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode: vnodeType, container: rootContainerType) {
  patch(vnode, container, null)
}

function patch(vnode: vnodeType, container: rootContainerType, parentComponent: instanceType | null) {
  const { type, shapeFlag } = vnode;

  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;

    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent);
      }
      break;
  }
}

function processText(vnode: any, container: any) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}

function processFragment(vnode: any, container: any, parentComponent: instanceType | null) {
  mountChildren(vnode, container, parentComponent);
}

function processComponent(vnode: vnodeType, container: rootContainerType, parentComponent: instanceType | null) {
  mountComponent(vnode, container, parentComponent)
}
function mountComponent(initialVNode: vnodeType, container: rootContainerType, parentComponent: instanceType | null) {
  const instance = createComponentInstance(initialVNode, parentComponent)

  setupComponent(instance)
  setupRenderEffect(instance, initialVNode, container)
}

function processElement(vnode: vnodeType, container: rootContainerType, parentComponent: instanceType | null) {
  mountElement(vnode, container, parentComponent)
}
function mountElement(vnode: vnodeType, container: rootContainerType, parentComponent: instanceType | null) {
  const { type, children, props } = vnode;
  const el = vnode.el = document.createElement(type);
  setElementProps(el, props);
  setElementChildren(vnode, el, children, parentComponent);

  (container as HTMLElement).append(el);
}
function mountChildren(vnode: vnodeType, container: rootContainerType, parentComponent: instanceType | null) {
  (vnode.children as []).forEach(v => patch(v, container, parentComponent))
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
function setElementChildren(vnode: vnodeType, el: HTMLElement, children: [] | string, parentComponent: instanceType | null) {
  if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.innerText = children as string
  } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent)
  }
}

function setupRenderEffect(instance: instanceType, initialVNode: vnodeType, container: rootContainerType) {
  const subTree = instance.render.call(instance.proxy)

  // vnode -> patch
  patch(subTree, container, instance)

  initialVNode.el = subTree.el
}

