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

  it("should return runner when call effect", () => {
    let a = 1
    const runner = effect(() => {
      a++
      return 'hello effect runner'
    })
    expect(a).toBe(2)

    const r = runner()
    expect(a).toBe(3)
    expect(r).toBe('hello effect runner')
  })

  it('scheduler', () => {
    let x = 0
    const obj = reactive({ a: 1 })

    let run: Function = () => { }
    const scheduler = jest.fn(() => {
      run = runner
    })
    const runner = effect(
      () => {
        x = obj.a
      },
      { scheduler }
    )

    // init
    expect(x).toBe(1)
    expect(scheduler).not.toHaveBeenCalled()

    // update
    obj.a++
    expect(x).toBe(1)
    expect(scheduler).toHaveBeenCalledTimes(1)

    // call update
    run()
    expect(x).toBe(2)
    expect(scheduler).toHaveBeenCalledTimes(1)

    // update
    obj.a++
    expect(x).toBe(2)
    expect(scheduler).toHaveBeenCalledTimes(2)
  })
})
