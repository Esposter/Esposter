<script lang="ts">
// oxlint-disable-next-line vue/require-direct-export -- defineNuxtLink returns a component object; false positive
export default defineNuxtLink({ componentName: "NuxtInvisibleLink" });
</script>

<style scoped>
@layer uno-base {
  a {
    color: inherit;
    text-decoration: none;
  }
}
</style>
