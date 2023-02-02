import { closeDelimiter, NodeTypes, openDelimiter, TagType } from "./ast"

type contentType = string
type contextType = {
  source: contentType
}
interface nodeType {
  type: NodeTypes,
}
interface interpolationType extends nodeType {
  content: nodeType & {
    content: contentType
  }
}
interface elementType extends nodeType {
  tag: string
}
interface textType extends nodeType {
  content: contentType
}
type childrenItemType = interpolationType | elementType | textType
type childrenType = Array<childrenItemType>
type rootType = { children: childrenType }

export const baseParse = (content: contentType): rootType => {
  const context: contextType = createParserContext(content);
  return createRoot(parseChildren(context));
}

const parseChildren = (context: contextType): childrenType => {
  const nodes: childrenType = [];

  let node: childrenItemType | undefined
  const s = context.source

  if (s.startsWith(openDelimiter)) {
    node = parseInterpolation(context);
  } else if (s[0] === '<') {
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context);
    }
  }

  if (!node) {
    node = parseText(context);
  }

  if (node) {
    nodes.push(node);
  }

  return nodes;
}
const parseInterpolation = (context: contextType): interpolationType => {
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );

  advanceBy(context, openDelimiter.length);

  const rawContentLength = closeIndex - openDelimiter.length;

  const rawContent = parseTextData(context, rawContentLength)
  const content = rawContent.trim()

  advanceBy(context, closeDelimiter.length);

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
function parseElement(context: contextType): elementType | undefined {
  const element = parseTag(context, TagType.Start)
  parseTag(context, TagType.End)

  if (element) {
    return element
  }
}

function parseTag(context: contextType, type: TagType): elementType | undefined {
  const match = /^<\/?([a-z]*)/i.exec(context.source)
  let tag = ''
  if (match) {
    tag = match[1]
    advanceBy(context, match[0].length)
    advanceBy(context, 1);
  }

  if (type === TagType.Start) {
    return {
      type: NodeTypes.ELEMENT,
      tag,
    }
  }
}

function parseText(context: contextType): textType | undefined {
  const content = parseTextData(context, context.source.length)

  return {
    type: NodeTypes.Text,
    content,
  }
}

function parseTextData(context: contextType, length: number): contentType {
  const content = context.source.slice(0, length)
  advanceBy(context, length)

  return content
}

