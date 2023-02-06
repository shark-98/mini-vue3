import { childrenItemType, codegenContextType, interpolationType, NodeTypes, rootType, textType } from "./ast";
import { helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers";

export const codegen = (root: rootType) => {
  const context = createCodegenContext()
  const { push } = context;

  genFunctionPreamble(root, context);


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
    },
    helper(key) {
      return `_${helperMapName[key]}`;
    },
  }

  return context;
}

function genNode(node: childrenItemType | undefined, context: codegenContextType) {
  if (!node) {
    return
  }

  switch (node.type) {
    case NodeTypes.TEXT:
      genText((node as textType), context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation((node as interpolationType), context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression((node as interpolationType), context);
      break;

    default:
      break;
  }


}

function genText(node: textType, context: codegenContextType) {
  const { push } = context;
  const val = `'${node.content}'`
  push(val);
}

function genInterpolation(node: interpolationType, context: codegenContextType) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(")");
}

function genExpression(node: interpolationType, context: codegenContextType) {
  const { push } = context;
  push(`${node.content}`);
}

function genFunctionPreamble(ast: rootType, context: codegenContextType) {
  const { push } = context;
  const VueBinging = "Vue";
  const aliasHelper = (s: string) => `${helperMapName[s]}:_${helperMapName[s]}`;
  console.log(ast);
  
  if (ast.helpers!.length > 0) {
    push(
      `const { ${ast.helpers!.map(aliasHelper).join(", ")} } = ${VueBinging}`
    );
  }
  push("\n");
  push("return ");
}

