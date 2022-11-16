import { ShapeFlags } from "../shared/ShapeFlags";
import { anyObjectType, instanceType, renderType, rootContainerType, vnodeType } from "../types/index";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";
import { effect } from "../reactivity";
import { hasOwn, hasValueObject } from "../shared";
export function createRenderer(option: renderType) {
  const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = option || {}

  function render(vnode: vnodeType, container: rootContainerType) {
    patch(null, vnode, container, null)
  }

  function patch(n1: vnodeType | null, n2: vnodeType, container: rootContainerType, parentComponent: instanceType | null) {
    const { type, shapeFlag } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  function processText(n1: any, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(n1: any, n2: any, container: any, parentComponent: instanceType | null) {
    mountChildren(n2.children, container, parentComponent);
  }

  function processComponent(n1: any, n2: vnodeType, container: rootContainerType, parentComponent: instanceType | null) {
    mountComponent(n2, container, parentComponent)
  }
  function mountComponent(initialVNode: vnodeType, container: rootContainerType, parentComponent: instanceType | null) {
    const instance = createComponentInstance(initialVNode, parentComponent)

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
  }

  function processElement(n1: any, n2: vnodeType, container: rootContainerType, parentComponent: instanceType | null) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }
  function mountElement(vnode: vnodeType, container: rootContainerType, parentComponent: instanceType | null) {
    const { type, children, props } = vnode;
    const el = vnode.el = hostCreateElement(type);
    setElementProps(el, props);
    setElementChildren(vnode, el, children, parentComponent);

    hostInsert(el, container);
  }
  function patchElement(n1: any, n2: vnodeType, container: rootContainerType, parentComponent: instanceType | null) {
    console.log('n1', n1)
    console.log('n2', n2)

    const el = n2.el = n1.el

    const prevProps = n1.props || {}
    const nextProps = n2.props || {}
    patchProps(el, prevProps, nextProps)
    patchChildren(n1, n2, el, parentComponent)
  }
  function patchChildren(n1: vnodeType, n2: vnodeType, el: HTMLElement, parentComponent: instanceType | null) {
    const { shapeFlag: prevShapeFlag, children: prevChildren } = n1
    const { shapeFlag: nextShapeFlag, children: nextChildren } = n2

    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(prevChildren)
      }
      if (prevChildren !== nextChildren) {
        hostSetElementText(el, nextChildren as string)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(el, '')
        mountChildren(nextChildren as [], el, parentComponent)
      }
    }
  }
  function unmountChildren(children: any) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRemove(el)
    }
  }
  function patchProps(el: HTMLElement, prevProps: any, nextProps: any) {
    if (prevProps === nextProps) {
      return
    }

    for (const key in nextProps) {
      if (hasOwn(nextProps, key) && prevProps[key] !== nextProps[key]) {
        hostPatchProp(el, key, prevProps[key], nextProps[key])
      }
    }

    if (!hasValueObject(prevProps)) {
      return
    }
    for (const key in prevProps) {
      if (hasOwn(prevProps, key) && !(key in nextProps)) {
        hostPatchProp(el, key, prevProps[key], null)
      }
    }


  }
  function mountChildren(children: [], container: rootContainerType, parentComponent: instanceType | null) {
    (children || []).forEach(v => patch(null, v, container, parentComponent))
  }
  function setElementProps(el: HTMLElement, props: anyObjectType) {
    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }
  }
  function setElementChildren(vnode: vnodeType, el: HTMLElement, children: [] | string, parentComponent: instanceType | null) {
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.innerText = children as string
    } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children as [], el, parentComponent)
    }
  }

  function setupRenderEffect(instance: instanceType, initialVNode: vnodeType, container: rootContainerType) {
    effect(() => {
      if (!instance.isMounted) {
        const subTree = instance.subTree = instance.render.call(instance.proxy)

        // vnode -> patch
        patch(null, subTree, container, instance)

        initialVNode.el = subTree.el

        instance.isMounted = true
      } else {
        const prevSubTree = instance.subTree
        const subTree = instance.render.call(instance.proxy)
        instance.subTree = subTree
        patch(prevSubTree, subTree, container, instance)
      }
    })

  }

  return {
    createApp: createAppAPI(render),
  }
}

