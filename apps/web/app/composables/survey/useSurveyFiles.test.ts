// @vitest-environment nuxt
import { useSurveyFiles } from "@/composables/survey/useSurveyFiles";
import { surveyDocumentSchema, SurveyNodeType } from "survey-engine";
import { afterEach, describe, expect, test, vi } from "vitest";

const { deleteFile, uploadFile } = vi.hoisted(() => ({
  deleteFile: vi.fn<(url: string) => Promise<void>>(() => Promise.resolve()),
  uploadFile: vi.fn<(file: File) => Promise<string>>(),
}));

vi.mock(import("@/composables/resource/useUploadResourceFile"), () => ({ useUploadResourceFile: () => uploadFile }));
vi.mock(import("@/composables/resource/useDeleteResourceFile"), () => ({ useDeleteResourceFile: () => deleteFile }));

// A survey whose one page holds an image question of the given picture, and whose logo is the given one
const createDocument = (imageLink: string, logo: string) =>
  surveyDocumentSchema.parse({
    content: [
      {
        props: {
          children: [{ props: { id: crypto.randomUUID(), imageLink, name: "image" }, type: SurveyNodeType.Image }],
          id: crypto.randomUUID(),
        },
        type: SurveyNodeType.Page,
      },
    ],
    root: { props: { logo } },
  });

describe(useSurveyFiles, () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("a picture the editor opened on is deleted at the close once the document drops it", async () => {
    expect.hasAssertions();

    const { sweep, track } = useSurveyFiles();
    track(createDocument("a", ""));
    await sweep(createDocument("", ""));

    expect(deleteFile).toHaveBeenCalledExactlyOnceWith("a");
  });

  test("a logo replaced in the session is deleted at the close, and the logo the document holds is kept", async () => {
    expect.hasAssertions();

    const { sweep, track, upload } = useSurveyFiles();
    track(createDocument("", "a"));
    uploadFile.mockResolvedValue("b");
    await upload(new File(["a"], "a"));
    await sweep(createDocument("", "b"));

    expect(deleteFile).toHaveBeenCalledExactlyOnceWith("a");
  });

  test("a file uploaded in the session and dropped before the close is deleted", async () => {
    expect.hasAssertions();

    const { sweep, track, upload } = useSurveyFiles();
    track(createDocument("", ""));
    uploadFile.mockResolvedValue("c");
    await upload(new File(["a"], "a"));
    await sweep(createDocument("", ""));

    expect(deleteFile).toHaveBeenCalledExactlyOnceWith("c");
  });

  test("a file the document still references is kept at the close", async () => {
    expect.hasAssertions();

    const { sweep, track } = useSurveyFiles();
    track(createDocument("a", ""));
    await sweep(createDocument("a", ""));

    expect(deleteFile).not.toHaveBeenCalled();
  });

  test("a picture whose upload lands after the editor closed is deleted, and no url is handed back to write", async () => {
    expect.hasAssertions();

    const { sweep, track, upload } = useSurveyFiles();
    track(createDocument("", ""));
    const { promise, resolve } = Promise.withResolvers<string>();
    uploadFile.mockReturnValueOnce(promise);
    const uploading = upload(new File(["a"], "a"));
    await sweep(createDocument("", ""));
    resolve("c");
    const url = await uploading;

    expect(url).toBeUndefined();
    expect(deleteFile).toHaveBeenCalledExactlyOnceWith("c");
  });

  test("an empty file is rejected before the upload, which then never runs", async () => {
    expect.hasAssertions();

    const { upload } = useSurveyFiles();
    const url = await upload(new File([], "a"));

    expect(url).toBeUndefined();
    expect(uploadFile).not.toHaveBeenCalled();
  });
});
