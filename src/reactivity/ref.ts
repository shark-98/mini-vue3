import { hasChange, isObject } from "../shared"
import { trackEffect, triggerEffect, isTracking } from "./effect"
import { reactive } from "./reactive"


class RefImpl {
  private _value: any
  private _dep: any
  private _rawValue: any
  constructor(value: any) {
    this._rawValue = value
    this._value = convert(value)
    this._dep = new Set()
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
