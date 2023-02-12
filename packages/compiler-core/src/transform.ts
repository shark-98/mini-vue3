import { allChildrenType, NodeTypes, rootType, transformContext, transformOptions, elementType } from './ast';
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export const transform = (root: rootType, options: transformOptions = {}) => {
  const context: transformContext = createTransformContext(root, options)
  traverseNode(root, context);
  createCodegenNode(root)

  root.helpers = [...context.helpers.keys()];
};

function createTransformContext(root: rootType, options: transformOptions): transformContext {
  const context: transformContext = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1);
    },
  };

  return context;
}

function traverseNode(node: allChildrenType, context: transformContext) {
  const nodeTransforms = context.nodeTransforms
  const exitFns: any = [];
  if ((Array.isArray(nodeTransforms) && nodeTransforms.length)) {
    for (let i = 0; i < nodeTransforms.length; i++) {
      const transform = nodeTransforms[i];
      const onExit = transform(node, context);
      if (onExit) exitFns.push(onExit);
    }
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node, context);
      break;

    default:
      break;
  }

  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
  }
}

const traverseChildren = (node: allChildrenType, context: transformContext) => {
  if (!('children' in node)) {
    return
  }

  const children = node.children
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    traverseNode(node, context);
  }
}

function createCodegenNode(root: rootType) {
  const child = root.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    root.codegenNode = (child as elementType).codegenNode;
  } else {
    root.codegenNode = child;
  }
}

