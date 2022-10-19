import { reactive } from "../reactive"

describe('reactive', () => {
  it('happy path', () => {
    const source = { a: 1 }
    const target = reactive(source)

    expect(source).not.toBe(target)
    expect(target.a).toBe(source.a)
    expect(target.a).toBe(1)
  })
})
