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
    patch(null, vnode, container, null, null)
  }

  function patch(n1: vnodeType | null, n2: vnodeType, container: rootContainerType, parentComponent: instanceType | null, anchor: HTMLElement | null) {
    const { type, shapeFlag } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processText(n1: any, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(n1: any, n2: any, container: any, parentComponent: instanceType | null, anchor: HTMLElement | null) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processComponent(n1: any, n2: vnodeType, container: rootContainerType, parentComponent: instanceType | null, anchor: HTMLElement | null) {
    mountComponent(n2, container, parentComponent, anchor)
  }
  function mountComponent(initialVNode: vnodeType, container: rootContainerType, parentComponent: instanceType | null, anchor: HTMLElement | null) {
    const instance = createComponentInstance(initialVNode, parentComponent)

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  function processElement(n1: any, n2: vnodeType, container: rootContainerType, parentComponent: instanceType | null, anchor: HTMLElement | null) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }
  function mountElement(vnode: vnodeType, container: rootContainerType, parentComponent: instanceType | null, anchor: HTMLElement | null) {
    const { type, children, props } = vnode;
    const el = vnode.el = hostCreateElement(type);
    setElementProps(el, props);
    setElementChildren(vnode, el, children, parentComponent, anchor);

    hostInsert(el, container, anchor);
  }
  function patchElement(n1: any, n2: vnodeType, container: rootContainerType, parentComponent: instanceType | null, anchor: HTMLElement | null) {
    const el = n2.el = n1.el

    const prevProps = n1.props || {}
    const nextProps = n2.props || {}
    patchProps(el, prevProps, nextProps)
    patchChildren(n1, n2, el, parentComponent, anchor)
  }
  function patchChildren(n1: vnodeType, n2: vnodeType, el: HTMLElement, parentComponent: instanceType | null, anchor: HTMLElement | null) {
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
        mountChildren(nextChildren as [], el, parentComponent, anchor)
      } else {
        // array diff
        patchKeyedChildren(prevChildren, nextChildren, el, parentComponent, anchor)
      }
    }
  }
  function patchKeyedChildren(c1: any, c2: any, container: HTMLElement, parentComponent: instanceType | null, parentAnchor: HTMLElement | null) {
    let i = 0
    const l2 = c2.length
    let e1 = c1.length - 1
    let e2 = l2 - 1

    function isSameVNodes(n1: anyObjectType, n2: anyObjectType) {
      return n1.type === n2.type && n1.key === n2.key
    }

    // 左侧对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNodes(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }

      i++
    }

    // 右侧对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if (isSameVNodes(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }

      e1--
      e2--
    }
    console.log(`i: ${i}, e1: ${e1}, e2: ${e2}`)

    // 新的比老的长 —— 创建
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) { // 老的比新的长 —— 删除
      if (i <= e1) {
        while (i <= e1) {
          hostRemove(c1[i].el)
          i++
        }
      }
    } else {
      // TODO:
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
  function mountChildren(children: [], container: rootContainerType, parentComponent: instanceType | null, anchor: HTMLElement | null) {
    (children || []).forEach(v => patch(null, v, container, parentComponent, anchor))
  }
  function setElementProps(el: HTMLElement, props: anyObjectType) {
    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }
  }
  function setElementChildren(vnode: vnodeType, el: HTMLElement, children: [] | string, parentComponent: instanceType | null, anchor: HTMLElement | null) {
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.innerText = children as string
    } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children as [], el, parentComponent, anchor)
    }
  }

  function setupRenderEffect(instance: instanceType, initialVNode: vnodeType, container: rootContainerType, anchor: HTMLElement | null) {
    effect(() => {
      if (!instance.isMounted) {
        const subTree = instance.subTree = instance.render.call(instance.proxy)

        // vnode -> patch
        patch(null, subTree, container, instance, anchor)

        initialVNode.el = subTree.el

        instance.isMounted = true
      } else {
        const prevSubTree = instance.subTree
        const subTree = instance.render.call(instance.proxy)
        instance.subTree = subTree
        patch(prevSubTree, subTree, container, instance, anchor)
      }
    })

  }

  return {
    createApp: createAppAPI(render),
  }
}

