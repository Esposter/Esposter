<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <!-- Wraps the controls nested inside a row that is a real anchor (a v-list-item with `:to`). `@click.stop`
    on the control itself is not enough: the DOM fixes an anchor's activation target while building the event
    path, before any listener runs, so stopping propagation only suppresses the router's own handler — the one
    thing that would have called preventDefault — and the browser still follows the href, hard-loading the row's
    route out from under the control's action. Only preventDefault cancels that, and it is spelled here rather
    than on each control so no row can hold half the pair. The wrapped control's own handler still runs: it
    fires at the target, before this listener sees the event bubble. Buttons only — preventDefault would also
    cancel the default action of a control that has one, like a checkbox's toggle -->
  <div flex items-center @click.stop.prevent>
    <slot />
  </div>
</template>
