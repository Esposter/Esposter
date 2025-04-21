<script lang="ts">
// @TODO: https://github.com/nuxt/nuxt/issues/31819
export default defineNuxtLink({ componentName: "NuxtInvisibleLink", trailingSlash: "append" });
</script>

<style scoped lang="scss">
a {
  color: inherit;
  text-decoration: none;
}
</style>
