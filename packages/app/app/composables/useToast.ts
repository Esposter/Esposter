import type { VSonner } from "vuetify-sonner";

import { DEFAULT_POSITION } from "@/services/toast/constants";
import { useToastStore } from "@/store/toast";
import { toast } from "vuetify-sonner";

export const useToast = (
  text: Parameters<typeof toast>[0],
  options?: Parameters<typeof toast>[1] & { position?: InstanceType<typeof VSonner>["$props"]["position"] },
) => {
  if (!options?.position) return toast(text, options);

  const toastStore = useToastStore();
  const { position } = storeToRefs(toastStore);
  position.value = options.position;
  return toast(text, {
    ...options,
    onAutoClose: (toast) => {
      options.onAutoClose?.(toast);
      position.value = DEFAULT_POSITION;
    },
    onDismiss: (toast) => {
      options.onDismiss?.(toast);
      position.value = DEFAULT_POSITION;
    },
  });
};
