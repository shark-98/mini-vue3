import { isProxy, isReadonly, reactive, readonly } from "../reactive";

describe('readonly', () => {
  it('happy path', () => {
    const obj = reactive({ a: 1, b: 2, c: { d: 'xx' } });
    const readonlyObj = readonly(obj)

    expect(readonlyObj).not.toBe(obj)
    expect(readonlyObj.a).toBe(1)
    expect(readonlyObj.b).toBe(2)

    expect(isReadonly(readonlyObj)).toBe(true)
    expect(isReadonly(obj)).toBe(false)
    expect(isReadonly(obj.a)).toBe(false)
    expect(isReadonly(obj.c)).toBe(false)
    expect(isReadonly(readonlyObj.a)).toBe(false)
    expect(isReadonly(readonlyObj.c)).toBe(true)
    expect(isProxy(readonlyObj)).toBe(true)
  })

  it('not set', () => {
    const obj = reactive({ a: 1 });
    const readonlyObj = readonly(obj)
    console.warn = jest.fn()

    readonlyObj.a = 10
    expect(readonlyObj.a).toBe(1)
    expect(console.warn).toHaveBeenCalled()
  })
})
