<template>
  <!-- The two buttons beneath a character menu's panel, the game's pills, each the panel's half less the gap between them -->
  <div class="buttons">
    <slot>
      <span class="button" />
      <span class="button" />
    </slot>
  </div>
</template>

<style scoped>
.buttons {
  position: absolute;
  top: calc(var(--unit) * 859);
  right: 0;
  left: 0;
  display: flex;
  gap: calc(var(--unit) * 23);
}

.button {
  flex: 1;
  height: calc(var(--unit) * 52);
  border-radius: calc(var(--unit) * 26);
  background: rgb(236 229 216 / 0.85);
}
</style>
