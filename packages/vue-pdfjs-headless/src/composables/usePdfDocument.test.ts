// @vitest-environment happy-dom
import type { PdfApi } from "#src/models/PdfApi";
import type { PdfRenderer } from "#src/models/PdfRenderer";
import type { PdfSource } from "#src/models/PdfSource";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";

import { usePdfDocument } from "#src/composables/usePdfDocument";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";
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
  const WORKER_SOURCE = "/worker.mjs";
  const NEED_PASSWORD = 1;
  const INCORRECT_PASSWORD = 2;
  const PASSWORD = " ";
  const createRenderer = (getDocument: PdfApi["getDocument"]): PdfRenderer => ({
    api: {
      getDocument,
      GlobalWorkerOptions: { workerSrc: "" },
      PasswordResponses: { INCORRECT_PASSWORD, NEED_PASSWORD },
    } as unknown as PdfApi,
    cMapUrl: "",
    standardFontDataUrl: "",
    wasmUrl: "",
    workerSrc: "",
  });
  const pdfDocument = {} as PDFDocumentProxy;

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    expect(task.destroy).toHaveBeenCalledExactlyOnceWith();
  });

  test("a failed load is cleared by a change of source", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    const failedTask = createTask(Promise.reject(new Error(" ")));
    const getDocument = vi
      .fn<PdfApi["getDocument"]>()
      .mockReturnValueOnce(failedTask)
      .mockReturnValueOnce(createTask(new Promise(() => {})));
    const source = ref<string>(url);
    const scope = effectScope();
    const state = scope.run(() => usePdfDocument({ renderer: createRenderer(getDocument), source }));
    await flushPromises();

    expect(state?.isFailed.value).toBe(true);
    source.value = otherUrl;
    await nextTick();

    expect({
      isFailed: state?.isFailed.value,
      isPasswordRequested: state?.isPasswordRequested.value,
      isPasswordWrong: state?.isPasswordWrong.value,
    }).toStrictEqual({ isFailed: false, isPasswordRequested: false, isPasswordWrong: false });
    scope.stop();
  });

  test("a password request from a load a source change released is ignored", async () => {
    expect.hasAssertions();

    const releasedTask = createTask(new Promise(() => {}));
    const getDocument = vi
      .fn<PdfApi["getDocument"]>()
      .mockReturnValueOnce(releasedTask)
      .mockReturnValueOnce(createTask(new Promise(() => {})));
    const source = ref<string>(url);
    const scope = effectScope();
    const state = scope.run(() => usePdfDocument({ renderer: createRenderer(getDocument), source }));
    await flushPromises();
    source.value = otherUrl;
    await nextTick();
    releasedTask.onPassword?.(() => {}, NEED_PASSWORD);
    await nextTick();

    expect(state?.isPasswordRequested.value).toBe(false);
    scope.stop();
  });

  test("a source change while a file is still being read destroys the task that arrives after it", async () => {
    expect.hasAssertions();

    const file = new File([new Uint8Array([1, 2, 3])], "report.pdf");
    const read = Promise.withResolvers<ArrayBuffer>();
    vi.spyOn(file, "arrayBuffer").mockReturnValue(read.promise);
    const staleTask = createTask(new Promise(() => {}));
    const getDocument = vi
      .fn<PdfApi["getDocument"]>()
      .mockReturnValueOnce(createTask(new Promise(() => {})))
      .mockReturnValueOnce(staleTask);
    const source = ref<PdfSource>(file);
    const scope = effectScope();
    scope.run(() => usePdfDocument({ renderer: createRenderer(getDocument), source }));
    await flushPromises();
    source.value = url;
    await nextTick();
    read.resolve(new ArrayBuffer(0));
    await flushPromises();

    expect(staleTask.destroy).toHaveBeenCalledExactlyOnceWith();
    scope.stop();
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

  test("#125 the renderer's getDocument loads the document with the worker it was given", async () => {
    expect.hasAssertions();

    const legacyTask = createTask(Promise.resolve(pdfDocument));
    const legacyGetDocument = vi.fn<PdfApi["getDocument"]>(() => legacyTask);
    const renderer = { ...createRenderer(legacyGetDocument), workerSrc: WORKER_SOURCE };
    const scope = effectScope();
    const state = scope.run(() => usePdfDocument({ renderer, source: url }));
    await flushPromises();

    expect(renderer.api.GlobalWorkerOptions.workerSrc).toBe(WORKER_SOURCE);
    expect(legacyGetDocument).toHaveBeenCalledExactlyOnceWith({
      cMapPacked: true,
      cMapUrl: "",
      standardFontDataUrl: "",
      url,
      wasmUrl: "",
    });
    expect(state?.pdfDocument.value).toBe(pdfDocument);
    scope.stop();
  });

  test("#69 #70 loading progress rises to the whole file", async () => {
    expect.hasAssertions();

    const { promise, resolve } = Promise.withResolvers<PDFDocumentProxy>();
    const task = createTask(promise);
    const scope = effectScope();
    const state = scope.run(() =>
      usePdfDocument({ renderer: createRenderer(vi.fn<PdfApi["getDocument"]>(() => task)), source: url }),
    );
    await flushPromises();
    task.onProgress?.({ loaded: 1, total: 4 });
    const firstPart = state?.progress.value;
    task.onProgress?.({ loaded: 4, total: 4 });
    resolve(pdfDocument);
    await flushPromises();

    expect(firstPart).toStrictEqual({ loaded: 1, total: 4 });
    expect(state?.progress.value).toStrictEqual({ loaded: 4, total: 4 });
    scope.stop();
  });

  test("#227 #67 loading parameters reach the renderer as given", async () => {
    expect.hasAssertions();

    const getDocument = vi.fn<PdfApi["getDocument"]>(() => createTask(new Promise(() => {})));
    const scope = effectScope();
    scope.run(() =>
      usePdfDocument({ parameters: { disableRange: true }, renderer: createRenderer(getDocument), source: url }),
    );
    await flushPromises();

    expect(getDocument).toHaveBeenCalledExactlyOnceWith({
      cMapPacked: true,
      cMapUrl: "",
      disableRange: true,
      standardFontDataUrl: "",
      url,
      wasmUrl: "",
    });
    scope.stop();
  });

  test("opening a local file", async () => {
    expect.hasAssertions();

    const bytes = new Uint8Array([1, 2, 3]);
    const getDocument = vi.fn<PdfApi["getDocument"]>(() => createTask(Promise.resolve(pdfDocument)));
    const scope = effectScope();
    const state = scope.run(() =>
      usePdfDocument({ renderer: createRenderer(getDocument), source: new File([bytes], "report.pdf") }),
    );
    await flushPromises();

    expect(getDocument).toHaveBeenCalledExactlyOnceWith({
      cMapPacked: true,
      cMapUrl: "",
      data: bytes,
      standardFontDataUrl: "",
      wasmUrl: "",
    });
    expect(state?.pdfDocument.value).toBe(pdfDocument);
    scope.stop();
  });
});
