// @vitest-environment happy-dom
import UiErrorState from "@/components/Ui/ErrorState.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiErrorState", () => {
  test("announces what went wrong and offers to try again", async () => {
    expect.hasAssertions();

    const error = "error";
    const component = mount(UiErrorState, { props: { error } });

    expect(component.attributes("role")).toBe("alert");
    expect(component.findAll("p").map((paragraph) => paragraph.text())).toStrictEqual(["Something went wrong", error]);

    await component.get("button").trigger("click");

    expect(component.emitted("retry")).toHaveLength(1);
  });
});
