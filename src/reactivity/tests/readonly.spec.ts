import { reactive, readonly } from "../reactive";

describe('readonly', () => {
  it('happy path', () => {
    const obj = reactive({ a: 1, b: 2 });
    const readonlyObj = readonly(obj)

    expect(readonlyObj).not.toBe(obj)
    expect(readonlyObj.a).toBe(1)
    expect(readonlyObj.b).toBe(2)
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
