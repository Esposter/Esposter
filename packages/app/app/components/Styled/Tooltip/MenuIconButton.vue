<script setup lang="ts">
import type { VBtn, VMenu, VTooltip } from "vuetify/components";

import { mergeProps } from "vue";

interface Props {
  buttonProps?: VBtn["$props"];
  icon?: string;
  menuProps?: VMenu["$props"];
  text?: string;
  tooltipProps?: VTooltip["$props"];
}
// The root is VMenu, whose fallthrough attrs land on VOverlay's popup element instead of the button — so
// Styling attrs would silently decorate the open menu. Route them to the button, which is what every call site
// Means by them; an explicit buttonProps entry still wins over the same attr
defineOptions({ inheritAttrs: false });
// `activator` is what the button draws. Without one it draws `icon`, which is what almost every call site
// Wants; with one it draws whatever the caller gives it — an avatar, a name, a count — and stops being
// Icon-shaped, since VBtn only rounds itself down to an icon while `icon` is set
defineSlots<{ activator?: () => VNode; default: () => VNode }>();
const { buttonProps = {}, icon = "", menuProps, text, tooltipProps } = defineProps<Props>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const isOpen = defineModel<boolean>({ default: false });
</script>

<template>
  <v-menu v-model="isOpen" :="menuProps">
    <template #activator="{ props: menuActivatorProps }">
      <v-tooltip :text :="tooltipProps">
        <template #activator="{ props: tooltipActivatorProps }">
          <!-- `icon || undefined`, never the `""` itself: VBtn types `icon` as Boolean among others, and Vue
            casts an empty string on such a prop to `true` the way a bare HTML attribute reads — which draws no
            icon and still shapes the button as one -->
          <v-btn
            :icon="icon || undefined"
            :="mergeProps(menuActivatorProps, tooltipActivatorProps, $attrs, buttonProps)"
            @click="emit('click', $event)"
          >
            <!-- `v-slot` carrying the `v-if` is what makes the slot conditional: VBtn draws `icon` only while
              it has no default slot, and a bare `<template v-if>` inside the outlet would register one
              regardless — blanking the button at every call site that passes an icon instead -->
            <template v-if="$slots.activator" #default>
              <slot name="activator" />
            </template>
          </v-btn>
        </template>
      </v-tooltip>
    </template>
    <slot />
  </v-menu>
</template>
