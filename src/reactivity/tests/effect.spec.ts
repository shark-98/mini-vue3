import { effect } from "../effect"
import { reactive } from "../reactive"

describe('effect', () => {
  it('happy path', () => {
    const obj = reactive({ foo: 1 })
    let num
    let doubleNum

    // init
    effect(() => {
      num = obj.foo + 1
    })
    effect(() => {
      doubleNum = obj.foo * 2
    })
    expect(num).toBe(2)
    expect(doubleNum).toBe(2)

    // update
    obj.foo = 10
    expect(num).toBe(11)
    expect(doubleNum).toBe(20)
  })
})
