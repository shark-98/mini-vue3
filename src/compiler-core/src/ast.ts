export const enum NodeTypes {
  INTERPOLATION,
  SIMPLE_EXPRESSION,
  ELEMENT,
  TEXT
}
export const enum TagType {
  START,
  END,
}

// parse
export type contentType = string
export type contextType = {
  source: contentType
}
export interface nodeType {
  type: NodeTypes,
}
export interface interpolationType extends nodeType {
  content: nodeType & {
    content: contentType
  }
}
export interface elementType extends nodeType {
  tag: string,
  children: Array<elementType | interpolationType | textType>
}
export interface textType extends nodeType {
  content: contentType
}
export type childrenItemType = interpolationType | elementType | textType
export type childrenType = Array<childrenItemType>
export type rootType = { children: childrenType, codegenNode?: childrenItemType }
export type allChildrenType = rootType | childrenItemType

// transform
export type nodeTransformsType = Function[]
export type transformOptions = {
  nodeTransforms?: nodeTransformsType
}
export type transformContext = {
  root: rootType
} & transformOptions

// generate
export type codegenContextType = {
  code: string,
  push: (source: string) => void
}

export const openDelimiter = '{{'
export const closeDelimiter = '}}'
export const startTag = '<'
export const closeTag = '>'
export const endTag = '</'
