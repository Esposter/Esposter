// @vitest-environment nuxt
import StyledNavigationDrawer from "@/components/Styled/Navigation/Drawer.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
import { h } from "vue";
import { VLayout } from "vuetify/components";

// A drawer needs a layout to inject, and the wrapper is only ever rendered inside one
const mountInLayout = (permanent: boolean) =>
  mountSuspended({
    render: () => h(VLayout, () => h(StyledNavigationDrawer, { modelValue: false, permanent })),
  });

describe("styledNavigationDrawer", () => {
  // Vuetify only forces a permanent drawer open when `permanent` changes to true, so a model that starts closed
  // Would otherwise leave the rail inert for the whole session
  test("shows a permanent drawer while its model is closed", async () => {
    expect.hasAssertions();

    const component = await mountInLayout(true);

    expect(component.find(".v-navigation-drawer").classes()).toContain("v-navigation-drawer--active");
  });

  test("hides a temporary drawer while its model is closed", async () => {
    expect.hasAssertions();

    const component = await mountInLayout(false);

    expect(component.find(".v-navigation-drawer").classes()).not.toContain("v-navigation-drawer--active");
  });
});
