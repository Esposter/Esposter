// @vitest-environment happy-dom
import type { PdfApi } from "#src/models/PdfApi";
import type { PdfRenderer } from "#src/models/PdfRenderer";
import type { PdfViewerApi } from "#src/models/PdfViewerApi";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";

import { usePdfDocument } from "#src/composables/usePdfDocument";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";

const createTask = (promise: Promise<unknown>) =>
  ({
    destroy: vi.fn<PDFDocumentLoadingTask["destroy"]>(),
    onPassword: undefined,
    onProgress: undefined,
    promise,
  }) as unknown as PDFDocumentLoadingTask;

describe(usePdfDocument, () => {
  const url = "/document.pdf";
  const otherUrl = "/other.pdf";
  const NEED_PASSWORD = 1;
  const INCORRECT_PASSWORD = 2;
  const PASSWORD = " ";
  const createRenderer = (getDocument: PdfApi["getDocument"]): PdfRenderer => ({
    api: {
      GlobalWorkerOptions: { workerSrc: "" },
      PasswordResponses: { INCORRECT_PASSWORD, NEED_PASSWORD },
      getDocument,
    } as unknown as PdfApi,
    cMapUrl: "",
    viewer: {} as PdfViewerApi,
    standardFontDataUrl: "",
    wasmUrl: "",
    workerSrc: "",
  });
  const pdfDocument = {} as PDFDocumentProxy;

  // Each test's scope stands in for the component the composable lives in, so stopping it is the unmount
  test("opening with the right password", async () => {
    expect.hasAssertions();

    const updatePassword = vi.fn<(password: string) => void>();
    const { promise, resolve } = Promise.withResolvers<PDFDocumentProxy>();
    const task = createTask(promise);
    const scope = effectScope();
    const state = scope.run(() =>
      usePdfDocument({ renderer: createRenderer(vi.fn<PdfApi["getDocument"]>(() => task)), source: url }),
    );
    await flushPromises();
    task.onPassword?.(updatePassword, NEED_PASSWORD);
    await nextTick();
    state?.submitPassword(PASSWORD);
    resolve(pdfDocument);
    await flushPromises();

    expect(updatePassword).toHaveBeenCalledExactlyOnceWith(PASSWORD);
    expect(state?.pdfDocument.value).toBe(pdfDocument);
    expect(state?.isPasswordRequested.value).toBe(false);
  });

  test("a wrong password asks again", async () => {
    expect.hasAssertions();

    const task = createTask(new Promise(() => {}));
    const scope = effectScope();
    const state = scope.run(() =>
      usePdfDocument({ renderer: createRenderer(vi.fn<PdfApi["getDocument"]>(() => task)), source: url }),
    );
    await flushPromises();
    task.onPassword?.(() => {}, INCORRECT_PASSWORD);
    await nextTick();

    expect(state?.isPasswordWrong.value).toBe(true);
    expect(state?.isPasswordRequested.value).toBe(true);
    expect(state?.pdfDocument.value).toBeUndefined();
  });

  test("a file that is not a PDF", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    const task = createTask(Promise.reject(new Error(" ")));
    const scope = effectScope();
    const state = scope.run(() =>
      usePdfDocument({ renderer: createRenderer(vi.fn<PdfApi["getDocument"]>(() => task)), source: url }),
    );
    await flushPromises();

    expect(state?.isFailed.value).toBe(true);
    expect(state?.pdfDocument.value).toBeUndefined();
  });

  test("changing the source mid-load", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    const firstLoad = Promise.withResolvers<PDFDocumentProxy>();
    const firstTask = createTask(firstLoad.promise);
    const secondTask = createTask(new Promise(() => {}));
    const getDocument = vi.fn<PdfApi["getDocument"]>().mockReturnValueOnce(firstTask).mockReturnValueOnce(secondTask);
    const source = ref<string>(url);
    const scope = effectScope();
    scope.run(() => usePdfDocument({ renderer: createRenderer(getDocument), source }));
    await flushPromises();
    source.value = otherUrl;
    await nextTick();
    firstLoad.reject(new Error(" "));
    await flushPromises();

    expect(firstTask.destroy).toHaveBeenCalledExactlyOnceWith();
    expect(console.error).not.toHaveBeenCalled();
  });

  test("unmounting mid-load", async () => {
    expect.hasAssertions();

    const task = createTask(new Promise(() => {}));
    const scope = effectScope();
    scope.run(() =>
      usePdfDocument({ renderer: createRenderer(vi.fn<PdfApi["getDocument"]>(() => task)), source: url }),
    );
    await flushPromises();
    scope.stop();

    expect(task.destroy).toHaveBeenCalledExactlyOnceWith();
  });
});
