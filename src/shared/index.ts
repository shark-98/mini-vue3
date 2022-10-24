export const extend = Object.assign

export const isObject = (val: any) => {
  return val !== null && typeof val === 'object'
}

export const hasChange = (newValue: any, value: any) => {
  return !Object.is(newValue, value)
}
