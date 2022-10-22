import { reactiveHandler, readonlyHandler } from "./baseHandlers"

function createReactiveObject(target: any, handler: any) {
  return new Proxy(target, handler);
}

export const reactive = (row: any) => {
  return createReactiveObject(row, reactiveHandler);
}

export const readonly = (row: any) => {
  return createReactiveObject(row, readonlyHandler);
}
