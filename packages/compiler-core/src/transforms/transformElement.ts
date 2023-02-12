import { allChildrenType, createVNodeCall, elementType, NodeTypes, transformContext } from '../ast';

export const transformElement = (node: allChildrenType, context: transformContext) => {
  const nodeVal = node as elementType
  if (nodeVal.type === NodeTypes.ELEMENT) {
    return () => {
      // tag
      const vnodeTag = `'${nodeVal.tag}'`;

      // props
      let vnodeProps;

      // children
      const children = nodeVal.children;
      let vnodeChildren = children[0];

      nodeVal.codegenNode = createVNodeCall(
        context,
        vnodeTag,
        vnodeProps,
        vnodeChildren
      );
    };
  }
}
