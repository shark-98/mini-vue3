// mini-vue 出口
import { baseCompile } from '@mini-vue/compiler-core/src';
export * from '@mini-vue/runtime-dom'
import * as runtimeDom from "@mini-vue/runtime-dom";
import { registerRuntimeCompiler } from "@mini-vue/runtime-dom";

function compileToFunction(template: string) {
  const { code } = baseCompile(template);
  const render = new Function("Vue", code)(runtimeDom);
  return render;
}

registerRuntimeCompiler(compileToFunction);
