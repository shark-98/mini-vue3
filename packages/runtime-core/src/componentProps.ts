import { anyObjectType, instanceType } from "@mini-vue/types";

export function initProps(instance: instanceType, rawProps: anyObjectType) {
  instance.props = rawProps || {};
}
