import { NodeTypes, allChildrenType } from './ast';

export function isText(node: allChildrenType) {
  return (
    node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION
  );
}
