import { allChildrenType, rootType, transformContext, transformOptions } from "./ast";

export const transform = (root: rootType, options: transformOptions) => {
  const context: transformContext = createTransformContext(root, options)
  traverseNode(root, context);
};

function createTransformContext(root: rootType, options: transformOptions): transformContext {
  const context: transformContext = {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };

  return context;
}

function traverseNode(node: allChildrenType, context: transformContext) {
  const nodeTransforms = context.nodeTransforms

  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    transform(node)
  }

  traverseChildren(node, context)
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

