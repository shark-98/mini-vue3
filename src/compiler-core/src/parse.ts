import { closeDelimiter, closeTag, endTag, NodeTypes, openDelimiter, startTag, TagType } from "./ast"

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
  tag: string,
  children: Array<elementType | interpolationType | textType>
}
interface textType extends nodeType {
  content: contentType
}
type childrenItemType = interpolationType | elementType | textType
type childrenType = Array<childrenItemType>
type rootType = { children: childrenType }

export const baseParse = (content: contentType): rootType => {
  const context: contextType = createParserContext(content);
  const result = createRoot(parseChildren(context, []));

  return result
}

const parseChildren = (context: contextType, tags: elementType['tag'][]): childrenType => {
  const nodes: childrenType = [];

  while (!isEnd(context, tags)) {
    let node: childrenItemType | undefined
    const s = context.source

    if (s.startsWith(openDelimiter)) {
      node = parseInterpolation(context);
    } else if (s[0] === startTag) {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, tags);
      }
    } else {
      node = parseText(context);
    }

    if (node) {
      nodes.push(node);
    }
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
function parseElement(context: contextType, tags: elementType['tag'][]): elementType | undefined {
  const element = parseTag(context, TagType.START)
  if (element) {
    tags.push(element.tag)
    element.children = parseChildren(context, tags);
    tags.pop()

    if (startsWithEndTagOpen(context.source, element.tag)) {
      parseTag(context, TagType.END);
    } else {
      throw new Error(`缺少结束标签:${element.tag}`);
    }
  }

  return element
}

function parseTag(context: contextType, type: TagType): elementType | undefined {
  const reg = new RegExp(`^${startTag}\/?([a-z]*)`, 'i')
  const match = reg.exec(context.source)

  let tag = ''
  if (match) {
    tag = match[1]
    advanceBy(context, match[0].length)
    advanceBy(context, closeTag.length);
  }

  if (type === TagType.START) {
    return {
      type: NodeTypes.ELEMENT,
      tag,
      children: []
    }
  }
}

function parseText(context: contextType): textType | undefined {
  const endToken = [openDelimiter, startTag]
  const s = context.source
  let endIndex = s.length
  for (let i = 0; i < endToken.length; i++) {
    const item = endToken[i];
    const index = s.indexOf(item)
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  const content = parseTextData(context, endIndex)

  return {
    type: NodeTypes.TEXT,
    content,
  }
}

function parseTextData(context: contextType, length: number): contentType {
  const content = context.source.slice(0, length)
  advanceBy(context, length)

  return content
}

function isEnd(context: contextType, tags: elementType['tag'][]) {
  const s = context.source

  if (s.startsWith(endTag)) {
    for (let i = tags.length - 1; i >= 0; i--) {
      const tag = tags[i];
      if (startsWithEndTagOpen(s, tag)) {
        return true;
      }
    }
  }

  return !s
}


function startsWithEndTagOpen(source: string, tag: elementType['tag']) {
  return (
    source.startsWith(endTag) &&
    source.slice(endTag.length, endTag.length + tag.length).toLowerCase() === tag.toLowerCase()
  );
}
