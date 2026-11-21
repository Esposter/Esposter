// @vitest-environment nuxt
import type { PostInPostWithRelations } from "@esposter/db-schema";

import PostCommentUpdateRichTextEditor from "#src/components/Post/Comment/UpdateRichTextEditor.vue";
import PostDescriptionRichTextEditor from "#src/components/Post/Description/RichTextEditor.vue";
import { createPost } from "#src/services/post/createPost.test";
import { findButton } from "#src/services/shared/findButton.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("postCommentUpdateRichTextEditor", () => {
  const { trpcMsw } = setupMswTrpc();

  // The save is held open until the server answers, and the draft stays in the editor under it, so a Cancel pressed
  // Meanwhile would drop the draft the server is about to keep. Cancel is disabled for as long as the save is out
  test("disables Cancel while the edit is being saved", async () => {
    expect.hasAssertions();

    const { promise: answer, resolve: answerUpdate } = Promise.withResolvers<PostInPostWithRelations>();
    trpcMsw.post.updateComment.mutation(() => answer);
    const comment = createPost({ parentId: v7() });
    const component = await mountSuspended(PostCommentUpdateRichTextEditor, { props: { comment } });
    component.findComponent(PostDescriptionRichTextEditor).vm.$emit("update:modelValue", "<p>edited</p>");
    await flushPromises();
    expect(findButton(component, "Cancel").disabled).toBe(false);

    findButton(component, "Save").click();
    await flushPromises();

    expect(findButton(component, "Cancel").disabled).toBe(true);
    answerUpdate(createPost({ id: comment.id, parentId: comment.parentId }));
    await flushPromises();
  });
});
