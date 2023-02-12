import { codegen } from '../src/codegen';
import { baseParse } from '../src/parse';
import { transform } from '../src/transform';
import { transformExpression } from '../src/transforms/transformExpression';
import { transformElement } from "../src/transforms/transformElement";
import { transformText } from "../src/transforms/transformText";

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

  it('element', () => {
    const ast = baseParse('<div>hi,{{message}}</div>')

    transform(ast, {
      nodeTransforms: [transformExpression, transformElement, transformText],
    })

    const { code } = codegen(ast);

    expect(code).toMatchSnapshot()
  })
})
