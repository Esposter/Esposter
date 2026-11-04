// @vitest-environment happy-dom
import ResourceSurveyFieldShell from "@/components/Resource/Survey/Field/Shell.vue";
import { mount } from "@vue/test-utils";
import { surveyTextNodePropsSchema } from "survey-engine";
import { describe, expect, test } from "vitest";

// A control that takes the shell's description and error as its own, as a field's control does
const slot = ({ describedBy }: { describedBy?: string }) => h("input", { "aria-describedby": describedBy });

describe("resourceSurveyFieldShell", () => {
  const description = "Pick one";
  const error = "message";
  const title = "title";
  const mountShell = (props: { description?: string; error?: string; isRequired?: boolean } = {}) =>
    mount(ResourceSurveyFieldShell, {
      props: {
        error: props.error ?? "",
        question: {
          ...surveyTextNodePropsSchema.parse({
            description: props.description,
            isRequired: props.isRequired,
            name: "a",
            title,
          }),
          id: crypto.randomUUID(),
        },
      },
      slots: { default: slot },
    });

  test("titles the control, marking no title required when the question is not", () => {
    expect.hasAssertions();

    const component = mountShell();

    expect(component.get("span").text()).toBe(title);
    expect(component.find("[sr-only]").exists()).toBe(false);
  });

  test("marks a required title with a star that speech skips, and says it is required", () => {
    expect.hasAssertions();

    const component = mountShell({ isRequired: true });

    expect(component.get('[aria-hidden="true"]').text()).toBe("*");
    expect(component.get("[sr-only]").text()).toBe("required");
  });

  test("draws the description under the title, and the control describes itself by it", () => {
    expect.hasAssertions();

    const component = mountShell({ description });
    const descriptionSpan = component.get('[id$="-description"]');

    expect(descriptionSpan.text()).toBe(description);
    expect(component.get("input").attributes("aria-describedby")).toBe(descriptionSpan.attributes("id"));
  });

  test("shows the error as an alert, and the control describes itself by it", () => {
    expect.hasAssertions();

    const component = mountShell({ error });
    const errorSpan = component.get('[role="alert"]');

    expect(errorSpan.text()).toBe(error);
    expect(component.get("input").attributes("aria-describedby")).toBe(errorSpan.attributes("id"));
  });

  test("describes the control by the description and the error together, in that order", () => {
    expect.hasAssertions();

    const component = mountShell({ description, error });
    const descriptionId = component.get('[id$="-description"]').attributes("id");
    const errorId = component.get('[role="alert"]').attributes("id");

    expect(component.get("input").attributes("aria-describedby")?.split(" ")).toStrictEqual([descriptionId, errorId]);
  });

  test("draws neither a description nor an error, and describes the control by neither, when it is given neither", () => {
    expect.hasAssertions();

    const component = mountShell();

    expect(component.find('[id$="-description"]').exists()).toBe(false);
    expect(component.find('[role="alert"]').exists()).toBe(false);
    expect(component.get("input").attributes("aria-describedby")).toBeUndefined();
  });
});
