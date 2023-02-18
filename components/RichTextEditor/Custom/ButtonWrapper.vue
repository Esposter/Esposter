<script lang="ts">
import { h } from "vue";
import { VDivider } from "vuetify/components";

export default {
  name: "ButtonWrapper",
  render() {
    const wrappedButton = this.$slots
      .default?.()
      .map((slotItem) => [h(VDivider, { thickness: "2", vertical: true, h: "8!", self: "center!" }), h(slotItem)]);
    return wrappedButton;
  },
};
</script>
