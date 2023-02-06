import { allChildrenType, interpolationType, NodeTypes } from "../ast";

export function transformExpression(node: allChildrenType) {
  if (node.type === NodeTypes.INTERPOLATION) {
    (node as interpolationType).content = processExpression((node as interpolationType).content);
  }
}

function processExpression(node: any) {
  node.content = `_ctx.${node.content}`;
  return node;
}
