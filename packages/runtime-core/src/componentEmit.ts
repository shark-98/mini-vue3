import { camelize, isFunction, toHandlerKey } from "@mini-vue/shared";
import { instanceType } from "@mini-vue/types";

export function emit(instance: instanceType, event: string, ...args: any[]) {
  const { props } = instance;

  const handlerName = toHandlerKey(camelize(event));
  const handler = props[handlerName];

  if (isFunction(handler)) {
    handler(...args)
  }
};
