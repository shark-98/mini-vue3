import { ShapeFlags } from "../shared/ShapeFlags";
import { anyObjectType, instanceType, renderType, rootContainerType, vnodeType } from "../types/index";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";
import { effect } from "../reactivity";
import { hasOwn, hasValueObject } from "../shared";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { queueJobs } from "./scheduler";
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
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor)
    } else {
      updateComponent(n1, n2)
    }
  }
  function mountComponent(initialVNode: vnodeType, container: rootContainerType, parentComponent: instanceType | null, anchor: HTMLElement | null) {
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ));

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  function updateComponent(n1: vnodeType, n2: vnodeType) {
    const instance = (n2.component = n1.component)!;
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
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
    // console.log(`i: ${i}, e1: ${e1}, e2: ${e2}`)

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
      // 中间对比
      let s1 = i;
      let s2 = i;
      const toBePatched = e2 - s2 + 1;
      let patched = 0;
      const keyToNewIndexMap = new Map()

      const newIndexToOldIndexMap = new Array(toBePatched)
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
      let moved = false;
      let maxNewIndexSoFar = 0;


      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i]

        if (patched >= toBePatched) {
          hostRemove(prevChild.el)
          continue
        }

        let newIndex
        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSameVNodes(prevChild, c2[j])) {
              newIndex = j
              break
            }
          }
        }

        if (newIndex === undefined) {
          hostRemove(prevChild.el)
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }

          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++
        }
      }

      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      let j = increasingNewIndexSequence.length - 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;

        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
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
    instance.update = effect(() => {
      if (!instance.isMounted) {
        const subTree = instance.subTree = instance.render.call(instance.proxy, instance.proxy)

        // vnode -> patch
        patch(null, subTree, container, instance, anchor)

        initialVNode.el = subTree.el

        instance.isMounted = true
      } else {
        console.log('update-component');

        const { next, vnode } = instance;
        if (next) {
          next.el = vnode.el;

          updateComponentPreRender(instance, next);
        }

        const prevSubTree = instance.subTree
        const subTree = instance.render.call(instance.proxy, instance.proxy)
        instance.subTree = subTree
        patch(prevSubTree, subTree, container, instance, anchor)
      }
    },
      {
        scheduler() {
          queueJobs(instance.update)
        }
      }
    )
  }

  return {
    createApp: createAppAPI(render),
  }
}

function updateComponentPreRender(instance: instanceType, nextVNode: vnodeType) {
  instance.vnode = nextVNode;
  instance.next = null;

  instance.props = nextVNode.props;
}

function getSequence(arr: number[]) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}

