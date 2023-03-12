import type { Constructor } from "type-fest";

export const getComponent = (type: Constructor<unknown>) => {
  switch (type) {
    case Boolean:
      return defineAsyncComponent(
        () => import("@/components/TableEditor/VuetifyComponent/PropertyRenderer/Boolean.vue")
      );
    case String:
      return defineAsyncComponent(
        () => import("@/components/TableEditor/VuetifyComponent/PropertyRenderer/String.vue")
      );
    case Number:
      return defineAsyncComponent(
        () => import("@/components/TableEditor/VuetifyComponent/PropertyRenderer/Number.vue")
      );
    default:
      return defineAsyncComponent(() => import("@/components/TableEditor/VuetifyComponent/PropertyRenderer/Empty.vue"));
  }
};
