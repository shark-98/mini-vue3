import { ExpandRecursively } from "../../types"
import { closeDelimiter, NodeTypes, openDelimiter } from "./ast"

type contentType = string
type contextType = {
  source: contentType
}
type childrenItemType = {
  type: NodeTypes,
  content: {
    type: NodeTypes,
    content: contentType
  }
} | undefined
type childrenType = ExpandRecursively<childrenItemType[]>
type rootType = { children: childrenType }

export const baseParse = (content: contentType): rootType => {
  const context: contextType = createParserContext(content);
  return createRoot(parseChildren(context));
}

const parseChildren = (context: contextType): childrenType => {
  const nodes: childrenType = [];

  let node;
  if (context.source.startsWith(openDelimiter)) {
    node = parseInterpolation(context);
  }

  nodes.push(node);

  return nodes;
}
const parseInterpolation = (context: contextType): childrenItemType => {
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );

  advanceBy(context, openDelimiter.length);

  const rawContentLength = closeIndex - openDelimiter.length;

  const rawContent = context.source.slice(0, rawContentLength);
  const content = rawContent.trim()

  advanceBy(context, rawContentLength + closeDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  }
}

const createRoot = (children: childrenType): rootType => {
  return {
    children
  };
}
const createParserContext = (content: contentType): contextType => {
  return {
    source: content
  };
}
const advanceBy = (context: contextType, length: number) => {
  context.source = context.source.slice(length);
}
