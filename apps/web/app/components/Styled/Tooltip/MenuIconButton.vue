<script setup lang="ts">
import type { VBtn, VMenu, VTooltip } from "vuetify/components";

import { getUiButtonProps } from "@/services/styled/getUiButtonProps";
import { mergeProps } from "vue";

interface Props {
  buttonProps?: VBtn["$props"];
  icon?: string;
  menuProps?: VMenu["$props"];
  text?: string;
  // Only its text is read: the library places every tooltip itself, below what it names unless there is no room
  tooltipProps?: VTooltip["$props"];
}
// The root is VMenu, whose fallthrough attrs land on VOverlay's popup element instead of the button — so
// Styling attrs would silently decorate the open menu. Route them to the button, which is what every call site
// Means by them
defineOptions({ inheritAttrs: false });
// `activator` is what the button draws. Without one it draws `icon`, which is what almost every call site wants; with
// One it draws whatever the caller gives it — an avatar, a name, a count
defineSlots<{ activator?: () => VNode; default: () => VNode }>();
const isOpen = defineModel<boolean>({ default: false });
const { buttonProps = {}, icon = "", menuProps, text, tooltipProps } = defineProps<Props>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const label = computed(() => text ?? tooltipProps?.text ?? "");
const uiButtonProps = computed(() => getUiButtonProps({ ...buttonProps, prependIcon: icon }));
</script>

<!-- The menu is still Vuetify's, since its content is; only the button it opens from is the library's -->
<template>
  <v-menu v-model="isOpen" :="menuProps">
    <template #activator="{ props: menuActivatorProps }">
      <UiTooltip :label>
        <template #default="{ activatorProps }">
          <UiButton
            :="mergeProps(menuActivatorProps, activatorProps, uiButtonProps.attributes, $attrs)"
            :aria-label="label"
            :disabled="uiButtonProps.isDisabled"
            :variant="uiButtonProps.variant"
            :class="{ 'px-0': !$slots.activator }"
            inline-flex
            items-center
            justify-center
            @click="emit('click', $event)"
          >
            <slot name="activator">
              <UiSpinner v-if="uiButtonProps.isLoading" />
              <span v-else :class="uiButtonProps.icon" size-6 />
            </slot>
          </UiButton>
        </template>
      </UiTooltip>
    </template>
    <slot />
  </v-menu>
</template>
