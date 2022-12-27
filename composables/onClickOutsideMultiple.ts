import type { MaybeElement, MaybeElementRef } from "@vueuse/core";
import type { Ref } from "vue";

export const onClickOutsideMultiple = (targets: MaybeElementRef<MaybeElement>[], handler: () => void) => {
  const itemRefsClickedOutside = Array.from<Ref<boolean>>({ length: targets.length }).fill(ref(false));

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const itemRef = itemRefsClickedOutside[i];

    onClickOutside(target, () => {
      itemRef.value = true;
    });
  }

  watch(itemRefsClickedOutside, () => {
    if (itemRefsClickedOutside.every((x) => x.value)) {
      handler();
      itemRefsClickedOutside.fill(ref(false));
    }
  });
};
