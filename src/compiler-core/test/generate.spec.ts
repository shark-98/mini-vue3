import { codegen } from '../src/codegen';
import { baseParse } from '../src/parse';
import { transform } from '../src/transform';
import { transformExpression } from '../src/transforms/transformExpression';

describe('generate', () => {
  it('string', () => {
    const ast = baseParse('hi')

    transform(ast)

    const { code } = codegen(ast);

    expect(code).toMatchSnapshot()
  })

  it('interpolation', () => {
    const ast = baseParse('{{message}}')

    transform(ast, {
      nodeTransforms: [transformExpression],
    })

    const { code } = codegen(ast);

    expect(code).toMatchSnapshot()
  })
})
