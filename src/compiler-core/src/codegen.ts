import { childrenItemType, codegenContextType, rootType, textType } from "./ast";

export const codegen = (root: rootType) => {
  const context = createCodegenContext()
  const { push } = context;
  push('return ')

  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const functionArgs = args.join(', ')
  push(`function ${functionName}(${functionArgs}) {`)

  push('return ')

  genNode(root.codegenNode, context);

  push('}')

  return {
    code: context.code
  }
};

function createCodegenContext(): codegenContextType {
  const context: codegenContextType = {
    code: '',
    push(source: string) {
      context.code += source
    }
  }

  return context;
}

function genNode(node: childrenItemType | undefined, context: codegenContextType) {
  if (!node) {
    return
  }

  const { push } = context;
  const val = `'${(node as textType).content}'`
  push(val);
}

