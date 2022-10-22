import { reactive, isReactive } from "../reactive"

describe('reactive', () => {
  it('happy path', () => {
    const source = { a: 1 }
    const target = reactive(source)

    expect(source).not.toBe(target)
    expect(target.a).toBe(source.a)
    expect(target.a).toBe(1)

    expect(isReactive(target)).toBe(true)
    expect(isReactive(source)).toBe(false)
  })
})
