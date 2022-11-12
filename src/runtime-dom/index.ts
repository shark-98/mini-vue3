import { createRenderer } from '../runtime-core';

function createElement(type: any) {
  return document.createElement(type)
}

function patchProp(el: any, key: any, val: any) {
  const isOn = (name: string) => /^on[A-Z]/.test(name)
  if (isOn(key)) {
    const event = key.slice(2).toLocaleLowerCase()
    el.addEventListener(event, val)
  } else {
    el.setAttribute(key, val)
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
