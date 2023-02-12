import { ReactiveEffect } from "@mini-vue/reactivity";
import { queuePreFlushCb } from "./scheduler";

export const watchEffect = (source: Function) => {
  function job() {
    effect.run();
  }

  let cleanup;
  const onCleanup = (fn: Function) => {
    cleanup = effect.onStop = () => {
      fn()
    }
  }

  const getter = () => {
    if (cleanup) {
      cleanup();
    }

    source(onCleanup)
  }

  const effect = new ReactiveEffect(getter, () => {
    queuePreFlushCb(job);
  });

  job()

  return () => {
    effect.stop()
  }
}
