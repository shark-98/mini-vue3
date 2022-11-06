import { camelize, isFunction, toHandlerKey } from "../shared/index";
import { instanceType } from "../types/index";

export function emit(instance: instanceType, event: string, ...args: any[]) {
  const { props } = instance;

  const handlerName = toHandlerKey(camelize(event));
  const handler = props[handlerName];

  if (isFunction(handler)) {
    handler(...args)
  }
};
