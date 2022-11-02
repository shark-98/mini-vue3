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

export const hasChange = (newValue: any, value: any) => {
  return !Object.is(newValue, value)
}
