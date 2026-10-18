// @vitest-environment nuxt
import PdfViewer from "@/components/Pdf/Viewer.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

// The viewer's state is the package's, so this file asserts the dialog's own part: the failure, the password prompt
// The password is handed back to the document, and no renderer is passed, so no document is ever shown
const mountViewer = (props: { isFailed?: boolean; isPasswordRequested?: boolean; isPasswordWrong?: boolean }) =>
  mountSuspended(PdfViewer, {
    props: { filename: "report.pdf", isFailed: false, isPasswordRequested: false, isPasswordWrong: false, ...props },
  });

describe("pdfViewer", () => {
  test("a PDF that fails to load says so in place of its pages", async () => {
    expect.hasAssertions();

    const component = await mountViewer({ isFailed: true });

    expect(component.text()).toContain("The PDF could not be loaded.");
  });

  test("a protected PDF asks for its password", async () => {
    expect.hasAssertions();

    const component = await mountViewer({ isPasswordRequested: true });

    expect(component.find('input[type="password"]').exists()).toBe(true);
  });

  test("a wrong password says so", async () => {
    expect.hasAssertions();

    const component = await mountViewer({ isPasswordRequested: true, isPasswordWrong: true });

    expect(component.text()).toContain("The password is wrong.");
  });

  test("the password is handed back to the document", async () => {
    expect.hasAssertions();

    const component = await mountViewer({ isPasswordRequested: true });
    await component.find('input[type="password"]').setValue("secret");
    await component.find("form").trigger("submit");
    await flushPromises();

    expect(component.emitted("submitPassword")).toStrictEqual([["secret"]]);
  });
});
