import type { VBtn, VCard } from "vuetify/components";

export interface DeleteFormDialogProps {
  cardProps?: VCard["$props"];
  confirmButtonProps?: VBtn["$props"];
  // Azure-style destructive guard: Delete stays disabled until this exact text is typed
  confirmName?: string;
}
