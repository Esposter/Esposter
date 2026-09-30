<template>
  <!-- The band a prompt is set in across the foot of a screen: a navy glass strip 44 units high, fading in over its -->
  <!-- Ends, its words centred in a light grey. Its glass and fade are solved from the scene the English recording -->
  <!-- Shows through it at the door -->
  <div class="prompt-band">
    <p class="text"><slot /></p>
  </div>
</template>

<style scoped>
.prompt-band {
  display: grid;
  height: calc(var(--unit) * 44);
  background: linear-gradient(
    90deg,
    transparent,
    rgb(0 8 38 / 0.37) calc(var(--unit) * 380),
    rgb(0 8 38 / 0.37) calc(100% - var(--unit) * 380),
    transparent
  );
  place-items: center;
}

.text {
  margin: 0;
  color: #dcdcdc;
  font-size: calc(var(--unit) * 29.5);
  font-weight: 600;
  line-height: 1;
}
</style>
