import { codegen } from "./codegen";
import { baseParse } from "./parse";
import { transform } from "./transform";
import { transformElement } from "./transforms/transformElement";
import { transformExpression } from "./transforms/transformExpression";
import { transformText } from "./transforms/transformText";

export const baseCompile = (template: string) => {

  const ast = baseParse(template)

  transform(ast, {
    nodeTransforms: [transformExpression, transformElement, transformText],
  })

  return codegen(ast);
}
