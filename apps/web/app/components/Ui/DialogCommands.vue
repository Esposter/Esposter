<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { UI_DIALOG_INJECTION_KEY } from "#src/services/ui/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The dialog's own commands — full screen where the dialog can take the page, and close — for the dialog this stands in.
// The title bar draws them, and a body that draws its own header in place of the title bar draws them there, so every
// Dialog offers the same commands from one place
// oxlint-disable-next-line no-restricted-globals -- the dialog a component stands in is its subtree's context, as a theme scope is
const dialog = inject(UI_DIALOG_INJECTION_KEY);
if (!dialog) throw new InvalidOperationError(Operation.Read, "UiDialogCommands", "it stands only inside a UiDialog");
const { isExpandable, isExpanded, isOpen } = dialog;
</script>

<template>
  <div flex gap-1 items-center>
    <UiIconButton
      v-if="isExpandable"
      :aria-pressed="isExpanded"
      label="Full screen"
      :meaning="isExpanded ? UiIconMeaning.Collapse : UiIconMeaning.Expand"
      :variant="UiButtonVariant.Quiet"
      @click="isExpanded = !isExpanded"
    />
    <UiIconButton
      label="Close"
      :meaning="UiIconMeaning.Remove"
      :variant="UiButtonVariant.Quiet"
      @click="isOpen = false"
    />
  </div>
</template>
