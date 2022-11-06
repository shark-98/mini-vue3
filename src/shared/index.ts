export const extend = Object.assign

export const isObject = (val: any) => {
  return val !== null && typeof val === 'object'
}
export const isString = (val: any) => {
  return typeof val === 'string'
}
export const isArray = (val: any) => {
  return Array.isArray(val)
}
export const isFunction = (val: string) => {
  return typeof val === 'function'
}

export const hasChange = (newValue: any, value: any) => {
  return !Object.is(newValue, value)
}

export const hasOwn = (obj: any, key: string) => Object.prototype.hasOwnProperty.call(obj, key)

export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : "";
};
