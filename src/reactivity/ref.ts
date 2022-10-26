import { hasChange, isObject } from "../shared"
import { trackEffect, triggerEffect, isTracking } from "./effect"
import { reactive } from "./reactive"


class RefImpl {
  private _value: any
  private _dep: any
  private _rawValue: any
  private __v_isRef: boolean
  constructor(value: any) {
    this._rawValue = value
    this._value = convert(value)
    this._dep = new Set()
    this.__v_isRef = true
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    if (hasChange(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffect(this._dep)
    }
  }
}

const convert = (value: any) => {
  return isObject(value) ? reactive(value) : value
}
const trackRefValue = (ref: any) => {
  if (isTracking()) {
    trackEffect(ref._dep);
  }
}

export const ref = (value: any) => {
  return new RefImpl(value)
}

export const isRef = (ref: any) => {
  return !!ref.__v_isRef
}

export const unRef = (ref: any) => {
  return isRef(ref) ? ref.value : ref
}
