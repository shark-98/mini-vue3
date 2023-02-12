import { isReadonly, reactive, readonly, shallowReadonly } from "../src/reactive";
import { vi } from 'vitest'


describe('shallowReadonly', () => {
  it('not set', () => {
    const obj = reactive({ a: 1 });
    const readonlyObj = readonly(obj)
    console.warn = vi.fn()

    readonlyObj.a = 10
    expect(readonlyObj.a).toBe(1)
    expect(console.warn).toHaveBeenCalled()
  })

  it('should not make non-reactive properties reactive', () => {
    const props = shallowReadonly({ a: { b: 1 } })
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.a)).toBe(false)
  })
})
