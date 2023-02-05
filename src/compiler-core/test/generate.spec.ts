import { codegen } from '../src/codegen';
import { baseParse } from '../src/parse';
import { transform } from '../src/transform';
describe('generate', () => {
  it('string', () => {
    const ast = baseParse('hi')

    transform(ast)

    const { code } = codegen(ast);

    expect(code).toMatchSnapshot()
  })
})
