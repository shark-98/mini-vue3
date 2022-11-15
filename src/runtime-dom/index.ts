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

function insert(el: any, parent: any) {
  parent.append(el)
}

const render: any = createRenderer({
  createElement,
  patchProp,
  insert
})

export function createApp(...args: any[]) {
  return render.createApp(...args)
}

export * from '../runtime-core'
