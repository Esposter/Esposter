import { getComponentName } from "#src/getComponentName";
import { describe, expect, test } from "vitest";

describe(getComponentName, () => {
  test("joins a component's folders and file in PascalCase", () => {
    expect.hasAssertions();

    expect(getComponentName("Button.vue")).toBe("Button");
    expect(getComponentName("Login/Screen.vue")).toBe("LoginScreen");
    expect(getComponentName("base/foo-bar/Button.vue")).toBe("BaseFooBarButton");
  });

  test("names a folder's own component by the folder", () => {
    expect.hasAssertions();

    expect(getComponentName("Login/Index.vue")).toBe("Login");
  });

  test("drops a leading part the file already starts with", () => {
    expect.hasAssertions();

    expect(getComponentName("Login/LoginScreen.vue")).toBe("LoginScreen");
  });
});
