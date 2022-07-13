import { Ref } from "nuxt/dist/app/compat/capi";

export const useClickOutside = (target: Ref<Element | undefined>, fn: () => void) => {
  if (!target.value) return;

  const listener = (e: MouseEvent) => {
    // No active element/clicked inside active region
    if (!target.value || e.target === target.value || e.composedPath().includes(target.value)) return;
    fn();
  };

  onMounted(() => window.addEventListener("click", listener));
  onBeforeUnmount(() => window.removeEventListener("click", listener));
};
