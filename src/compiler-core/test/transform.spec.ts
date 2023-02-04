import { allChildrenType, elementType, NodeTypes, rootType, textType } from "../src/ast"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"

describe('transform', () => {

  it('happy path', () => {
    const ast: rootType = baseParse('<div>hi,{{message}}</div>')

    const plugin = (node: allChildrenType) => {
      if ('type' in node && node.type === NodeTypes.TEXT) {
        if ('content' in node) {
          node.content = node.content + " mini-vue";
        }
      }
    }

    transform(ast, { nodeTransforms: [plugin] })

    const nodeText = (ast.children[0] as elementType).children[0];
    expect((nodeText as textType).content).toBe("hi, mini-vue");
  })
})
