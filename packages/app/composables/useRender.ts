import Fragment from "@/components/Fragment.vue";
import { render } from "vue";
// https://github.com/vuejs/rfcs/discussions/582
export const useRender = (container: Ref<Element | undefined>) => {
  const globalAppContext = getCurrentInstance()?.appContext ?? null;

  onUnmounted(() => {
    if (!container.value) return;
    render(null, container.value);
  });

  return (components: Parameters<typeof h>[] = []) => {
    if (!container.value) return;
    else if (components.length === 0) {
      render(null, container.value);
      return;
    }

    const vnode = h(Fragment, () =>
      components.map((c) => {
        const vnode = h(...c);
        vnode.appContext = globalAppContext;
        return vnode;
      }),
    );
    vnode.appContext = globalAppContext;
    render(vnode, container.value);
  };
};
