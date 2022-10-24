import { reactive, isReactive, isProxy } from "../reactive"

describe('reactive', () => {
  it('happy path', () => {
    const source = { a: 1 }
    const target = reactive(source)

    expect(source).not.toBe(target)
    expect(target.a).toBe(source.a)
    expect(target.a).toBe(1)

    expect(isReactive(target)).toBe(true)
    expect(isReactive(source)).toBe(false)
    expect(isProxy(target)).toBe(true)
  })

  test("nested reactives", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
      num: 1
    };
    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
    expect(isReactive(observed.num)).toBe(false);
  });
})
