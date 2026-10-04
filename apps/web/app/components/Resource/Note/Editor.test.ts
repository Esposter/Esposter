// @vitest-environment nuxt

import { EMPTY_NOTE_DOC } from "#shared/services/resource/constants";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceNoteEditor from "@/components/Resource/Note/Editor.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { Editor } from "@tiptap/vue-3";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe("resourceNoteEditor", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();

  beforeEach(() => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({
      ...createResourceListItem({ id: resourceId, type: ResourceType.Note }),
      publication: null,
    }));
    trpcMsw.note.readResourceContent.query(() => ({ doc: EMPTY_NOTE_DOC }));
    trpcMsw.note.readResourcePublication.query(() => undefined);
  });

  test("tears the editor down once on unmount", async () => {
    expect.hasAssertions();

    const destroy = vi.spyOn(Editor.prototype, "destroy");
    const component = await mountSuspended(ResourceNoteEditor);
    component.unmount();

    expect(destroy).toHaveBeenCalledExactlyOnceWith();
  });
});
