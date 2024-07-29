import type { TupleSlice } from "@/util/types/TupleSlice";
import { render } from "vue";
// https://github.com/vuejs/rfcs/discussions/582
export const useRender = (container: Ref<Element | null>) => {
  const globalAppContext = getCurrentInstance()?.appContext ?? null;

  onUnmounted(() => {
    if (!container.value) return;
    render(null, container.value);
  });

  return (...args: [Parameters<typeof h>[0] | null, ...TupleSlice<Parameters<typeof h>, 1>]) => {
    if (!container.value) return;

    const [component, props] = args;
    if (!component) {
      render(null, container.value);
      return;
    }

    const vnode = h(component, props);
    vnode.appContext = globalAppContext;
    render(vnode, container.value);
  };
};
