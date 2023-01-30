import { vnodeType } from '../types/index';

export function shouldUpdateComponent(prevVNode: vnodeType, nextVNode: vnodeType) {
  const { props: prevProps } = prevVNode;
  const { props: nextProps } = nextVNode;

  for (const key in nextProps) {
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }

  return false;
}
