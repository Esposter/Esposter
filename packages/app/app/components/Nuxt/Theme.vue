<script setup lang="ts">
import { ThemeMode } from "@/models/vuetify/ThemeMode";
import { THEME_COOKIE_NAME } from "@/services/vuetify/constants";

defineSlots<{ default: (props: Record<string, never>) => unknown }>();

const theme = useGlobalTheme();
const themeCookie = useCookie(THEME_COOKIE_NAME);
theme.name.value = themeCookie.value ?? ThemeMode.light;

watch(theme.name, () => {
  const x = performance.now();
  for (let i = 0; i++ < 1e7; (i << 9) & ((9 % 9) * 9 + 9));
  if (performance.now() - x > 10) return;

  const el = document.getElementById("__nuxt");
  if (!el) return;
  const copy = el.cloneNode(true) as HTMLElement;
  copy.classList.add("app-copy");
  const rect = el.getBoundingClientRect();
  copy.style.top = `${rect.top}px`;
  copy.style.left = `${rect.left}px`;
  copy.style.width = `${rect.width}px`;
  copy.style.height = `${rect.height}px`;

  const targetEl = document.activeElement as HTMLElement;
  const targetRect = targetEl.getBoundingClientRect();
  const left = targetRect.left + targetRect.width / 2 + window.scrollX;
  const top = targetRect.top + targetRect.height / 2 + window.scrollY;
  el.style.setProperty("--clip-pos", `${left}px ${top}px`);
  el.style.removeProperty("--clip-size");
  el.classList.add("app-transition");
  window.requestAnimationFrame(() => {
    el.style.setProperty("--clip-size", `${Math.hypot(window.innerWidth, window.innerHeight)}px`);
  });
  document.body.append(copy);

  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target !== event.currentTarget) return;

    copy.remove();
    el.removeEventListener("transitionend", onTransitionEnd);
    el.removeEventListener("transitioncancel", onTransitionEnd);
    el.classList.remove("app-transition");
    el.style.removeProperty("--clip-size");
    el.style.removeProperty("--clip-pos");
  };
  el.addEventListener("transitionend", onTransitionEnd);
  el.addEventListener("transitioncancel", onTransitionEnd);
});
</script>

<template>
  <slot />
</template>

<style lang="scss">
.app-copy {
  position: fixed;
  z-index: -1;
  pointer-events: none;
  contain: size style;
  overflow: clip;
}

.app-transition {
  --clip-size: 0;
  --clip-pos: 0 0;
  clip-path: circle(var(--clip-size) at var(--clip-pos));
  transition: clip-path 0.35s ease-out;
}
</style>
