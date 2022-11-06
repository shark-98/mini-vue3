import { anyObjectType, instanceType } from "../types/index";

export function initProps(instance: instanceType, rawProps: anyObjectType) {
  instance.props = rawProps || {};
}
