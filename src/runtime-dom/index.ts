import { createRenderer } from '../runtime-core';

function createElement(type: any) {
  return document.createElement(type)
}

function patchProp(el: any, key: any, oldVal: any, newVal: any) {
  const isOn = (name: string) => /^on[A-Z]/.test(name)
  if (isOn(key)) {
    const event = key.slice(2).toLocaleLowerCase()
    el.addEventListener(event, newVal)
  } else {
    if ([undefined, null].includes(newVal)) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, newVal)
    }
  }
}

function insert(child: any, parent: any, anchor: HTMLElement | null) {
  // parent.append(child)
  parent.insertBefore(child, anchor || null)
}

function remove(child: any) {
  const parent = child.parentNode
  if (parent) {
    parent.removeChild(child)
  }
}
function setElementText(el: HTMLElement, text: string) {
  el.textContent = text
}

const render: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText
})

export function createApp(...args: any[]) {
  return render.createApp(...args)
}

export * from '../runtime-core'
