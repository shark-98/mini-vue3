import { isString } from "../../shared";
import { childrenItemType, childrenType, codegenContextType, elementCodegenNodeType, elementType, interpolationType, NodeTypes, rootType, textType } from "./ast";
import { helperMapName, TO_DISPLAY_STRING, CREATE_ELEMENT_VNODE } from "./runtimeHelpers";

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
    case NodeTypes.ELEMENT:
      genElement((node as elementCodegenNodeType), context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression((node as elementCodegenNodeType), context);
      break;

    default:
      break;
  }
}

function genCompoundExpression(node: elementCodegenNodeType, context: codegenContextType) {
  const { push } = context;
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isString(child)) {
      push(child);
    } else {
      genNode(child, context);
    }
  }
}

function genElement(node: elementCodegenNodeType, context: codegenContextType) {
  const { push, helper } = context;
  const { tag, children, props } = node;
  push(`${helper(CREATE_ELEMENT_VNODE)}(`);
  genNodeList(genNullable([tag, props, children]), context);
  push(")");
}
function genNodeList(nodes: any, context: codegenContextType) {
  const { push } = context;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isString(node)) {
      push(node);
    } else {
      genNode(node, context);
    }

    if (i < nodes.length - 1) {
      push(", ")
    }
  }
}

function genNullable(args: any[]) {
  return args.map((arg) => arg || "null");
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

  if (ast.helpers!.length > 0) {
    push(
      `const { ${ast.helpers!.map(aliasHelper).join(", ")} } = ${VueBinging}`
    );
  }
  push("\n");
  push("return ");
}

