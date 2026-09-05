// @vitest-environment nuxt
import type { ResourceWithPublication } from "#shared/models/resource/ResourceWithPublication";

import { EMPTY_NOTE_DOC } from "#shared/models/resource/note/NoteResource";
import ResourceNoteEditor from "@/components/Resource/Note/Editor.vue";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { Editor } from "@tiptap/vue-3";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe("resourceNoteEditor", () => {
  const server = setupMswTrpc();
  const resourceId = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
    useRouter().currentRoute.value.params.id = resourceId;
    server.use(
      trpcMsw.resource.readResource.query(
        () =>
          ({
            contentVersion: 0,
            id: resourceId,
            name: "name",
            publication: null,
            type: ResourceType.Note,
            updatedAt: new Date(0),
          }) as ResourceWithPublication,
      ),
      trpcMsw.note.readResourceContent.query(() => ({ doc: EMPTY_NOTE_DOC })),
      trpcMsw.note.readResourcePublication.query(() => undefined),
    );
  });

  test("tears the editor down once on unmount", async () => {
    expect.hasAssertions();

    const destroy = vi.spyOn(Editor.prototype, "destroy");
    const component = await mountSuspended(ResourceNoteEditor);
    component.unmount();

    expect(destroy).toHaveBeenCalledExactlyOnceWith();
  });
});
