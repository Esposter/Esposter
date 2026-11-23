// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useSurveyFiles } from "#src/composables/survey/useSurveyFiles";
import { useResourceStore } from "#src/store/resource/index";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";
import { surveyDocumentSchema, SurveyNodeType } from "vue-survey-engine-headless";

const { deleteFile, uploadFile } = vi.hoisted(() => ({
  deleteFile: vi.fn<(id: string, url: string) => void>(),
  uploadFile: vi.fn<(file: File) => Promise<string>>(),
}));

vi.mock(import("#src/composables/resource/useUploadResourceFile"), () => ({ useUploadResourceFile: () => uploadFile }));
vi.mock(import("#src/composables/resource/useDeleteResourceFile"), () => ({ useDeleteResourceFile: () => deleteFile }));

// A survey whose one page holds an image question of the given picture, and whose logo is the given one
const createDocument = (imageLink: string, logo: string) =>
  surveyDocumentSchema.parse({
    content: [
      {
        props: {
          children: [{ props: { id: v7(), imageLink, name: "image" }, type: SurveyNodeType.Image }],
          enableIf: "",
          id: v7(),
        },
        type: SurveyNodeType.Page,
      },
    ],
    root: { props: { backgroundImage: "", logo } },
  });

describe(useSurveyFiles, () => {
  test("a picture the editor opened on is deleted at the close once the document drops it", () => {
    expect.hasAssertions();

    const { sweep, track } = useSurveyFiles();
    track(createDocument("a", ""));
    sweep(createDocument("", ""));

    expect(deleteFile).toHaveBeenCalledExactlyOnceWith("", "a");
  });

  test("a logo replaced in the session is deleted at the close, and the logo the document holds is kept", async () => {
    expect.hasAssertions();

    const { sweep, track, upload } = useSurveyFiles();
    track(createDocument("", "a"));
    uploadFile.mockResolvedValue("b");
    await upload(new File(["a"], "a"));
    sweep(createDocument("", "b"));

    expect(deleteFile).toHaveBeenCalledExactlyOnceWith("", "a");
  });

  test("a file uploaded in the session and dropped before the close is deleted", async () => {
    expect.hasAssertions();

    const { sweep, track, upload } = useSurveyFiles();
    track(createDocument("", ""));
    uploadFile.mockResolvedValue("c");
    await upload(new File(["a"], "a"));
    sweep(createDocument("", ""));

    expect(deleteFile).toHaveBeenCalledExactlyOnceWith("", "c");
  });

  test("a file the document still references is kept at the close", () => {
    expect.hasAssertions();

    const { sweep, track } = useSurveyFiles();
    track(createDocument("a", ""));
    sweep(createDocument("a", ""));

    expect(deleteFile).not.toHaveBeenCalled();
  });

  test("a picture whose upload lands after the editor closed is deleted, and no url is handed back to write", async () => {
    expect.hasAssertions();

    const { sweep, track, upload } = useSurveyFiles();
    track(createDocument("", ""));
    const { promise, resolve } = Promise.withResolvers<string>();
    uploadFile.mockReturnValueOnce(promise);
    const uploading = upload(new File(["a"], "a"));
    sweep(createDocument("", ""));
    resolve("c");
    const url = await uploading;

    expect(url).toBeUndefined();
    expect(deleteFile).toHaveBeenCalledExactlyOnceWith("", "c");
  });

  test("a picture whose upload lands after the next survey opened is deleted from the resource it went to, and kept by neither survey", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { applyResource, clearResource } = resourceStore;
    const resource = createResourceListItem();
    applyResource(resource, null, null);
    const { sweep, track, upload } = useSurveyFiles();
    track(createDocument("", ""));
    uploadFile.mockImplementationOnce(() => {
      clearResource(resource.id);
      applyResource(createResourceListItem(), null, null);
      track(createDocument("", ""));
      return Promise.resolve("c");
    });
    const url = await upload(new File(["a"], "a"));
    sweep(createDocument("", ""));

    expect(url).toBeUndefined();
    expect(deleteFile).toHaveBeenCalledExactlyOnceWith(resource.id, "c");
  });

  test("an empty file is rejected before the upload, which then never runs", async () => {
    expect.hasAssertions();

    const { upload } = useSurveyFiles();
    const url = await upload(new File([], "a"));

    expect(url).toBeUndefined();
    expect(uploadFile).not.toHaveBeenCalled();
  });
});
