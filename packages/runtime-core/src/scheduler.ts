const queue: any[] = []
const activePreFlushCbs: any[] = [];
let isFlushPending = false;
const p = Promise.resolve()

export function nextTick(fn?: any) {
  return fn ? p.then(fn) : p;
}

export const queueJobs = (job: Function) => {
  if (!queue.includes(job)) {
    queue.push(job)
  }
  queueFlush()
}

export function queuePreFlushCb(job: Function) {
  activePreFlushCbs.push(job);

  queueFlush();
}
function flushPreFlushCbs() {
  for (let i = 0; i < activePreFlushCbs.length; i++) {
    activePreFlushCbs[i]();
  }
}

function queueFlush() {
  if (isFlushPending) return;
  isFlushPending = true;

  nextTick(flushJobs)
}

function flushJobs() {
  isFlushPending = false;

  flushPreFlushCbs();

  let job: Function;
  while (job = queue.shift()) {
    job && job();
  }
}

