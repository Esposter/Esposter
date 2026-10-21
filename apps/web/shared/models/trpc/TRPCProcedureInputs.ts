import type { saveClickerInputSchema } from "#shared/models/db/clicker/SaveClickerInput";
import type { saveDungeonsInputSchema } from "#shared/models/db/dungeons/SaveDungeonsInput";
import type { deleteMessageInputSchema } from "#shared/models/db/message/DeleteMessageInput";
import type { forwardMessageInputSchema } from "#shared/models/db/message/ForwardMessageInput";
import type { messageCompositeKeySchema } from "#shared/models/db/message/MessageCompositeKey";
import type { updateMessageInputSchema } from "#shared/models/db/message/UpdateMessageInput";
import type { zonedCreateMessageInputSchema } from "#shared/models/db/message/ZonedCreateMessageInput";
import type { createCommentInputSchema } from "#shared/models/db/post/CreateCommentInput";
import type { createLikeInputSchema } from "#shared/models/db/post/CreateLikeInput";
import type { createPostInputSchema } from "#shared/models/db/post/CreatePostInput";
import type { deleteCommentInputSchema } from "#shared/models/db/post/DeleteCommentInput";
import type { deleteLikeInputSchema } from "#shared/models/db/post/DeleteLikeInput";
import type { deletePostInputSchema } from "#shared/models/db/post/DeletePostInput";
import type { updateCommentInputSchema } from "#shared/models/db/post/UpdateCommentInput";
import type { updatePostInputSchema } from "#shared/models/db/post/UpdatePostInput";
import type { createResourceInputSchema } from "#shared/models/db/resource/CreateResourceInput";
import type { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import type { updateResourceInputSchema } from "#shared/models/db/resource/UpdateResourceInput";
import type { createInviteInputSchema } from "#shared/models/db/room/CreateInviteInput";
import type { createRoomInputSchema } from "#shared/models/db/room/CreateRoomInput";
import type { deleteRoomInputSchema } from "#shared/models/db/room/DeleteRoomInput";
import type { joinRoomInputSchema } from "#shared/models/db/room/JoinRoomInput";
import type { leaveRoomInputSchema } from "#shared/models/db/room/LeaveRoomInput";
import type { updateRoomInputSchema } from "#shared/models/db/room/UpdateRoomInput";
import type { createSurveyResponseInputSchema } from "#shared/models/db/survey/CreateSurveyResponseInput";
import type { updateSurveyResponseInputSchema } from "#shared/models/db/survey/UpdateSurveyResponseInput";
import type { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import type { ResourceInResource, ResourceType } from "@esposter/db-schema";
import type { z } from "zod";

export type TRPCPath = keyof TRPCProcedureInputs;

// The input of every procedure an achievement can be triggered by, keyed by the path the router gives it. The
// Achievement definitions read this instead of the router, so a router's types never depend on the achievement
// Plugin that uses them. test-d beside this file checks each entry against the real router
export interface TRPCProcedureInputs {
  "clicker.saveClicker": z.input<typeof saveClickerInputSchema>;
  "dungeons.saveDungeons": z.input<typeof saveDungeonsInputSchema>;
  "email.saveResourceContent": ResourceContentSaveInput<
    (typeof ResourceDefinitionMap)[ResourceType.Email]["contentSchema"]
  >;
  "flowchart.saveResourceContent": ResourceContentSaveInput<
    (typeof ResourceDefinitionMap)[ResourceType.Flowchart]["contentSchema"]
  >;
  "invite.createInvite": z.input<typeof createInviteInputSchema>;
  "like.createLike": z.input<typeof createLikeInputSchema>;
  "like.deleteLike": z.input<typeof deleteLikeInputSchema>;
  "message.createMessage": z.input<typeof zonedCreateMessageInputSchema>;
  "message.deleteMessage": z.input<typeof deleteMessageInputSchema>;
  "message.forwardMessage": z.input<typeof forwardMessageInputSchema>;
  "message.pinMessage": z.input<typeof messageCompositeKeySchema>;
  "message.unpinMessage": z.input<typeof messageCompositeKeySchema>;
  "message.updateMessage": z.input<typeof updateMessageInputSchema>;
  "post.createComment": z.input<typeof createCommentInputSchema>;
  "post.createPost": z.input<typeof createPostInputSchema>;
  "post.deleteComment": z.input<typeof deleteCommentInputSchema>;
  "post.deletePost": z.input<typeof deletePostInputSchema>;
  "post.updateComment": z.input<typeof updateCommentInputSchema>;
  "post.updatePost": z.input<typeof updatePostInputSchema>;
  "room.createRoom": z.input<typeof createRoomInputSchema>;
  "room.deleteRoom": z.input<typeof deleteRoomInputSchema>;
  "room.joinRoom": z.input<typeof joinRoomInputSchema>;
  "room.leaveRoom": z.input<typeof leaveRoomInputSchema>;
  "room.updateRoom": z.input<typeof updateRoomInputSchema>;
  "sheet.saveResourceContent": ResourceContentSaveInput<
    (typeof ResourceDefinitionMap)[ResourceType.Sheet]["contentSchema"]
  >;
  "survey.createResource": z.input<typeof createResourceInputSchema>;
  "survey.createSurveyResponse": z.input<typeof createSurveyResponseInputSchema>;
  "survey.deleteResource": z.input<typeof resourceIdInputSchema>;
  "survey.publishResource": z.input<typeof resourceIdInputSchema>;
  "survey.saveResourceContent": ResourceContentSaveInput<
    (typeof ResourceDefinitionMap)[ResourceType.Survey]["contentSchema"]
  >;
  "survey.updateResource": z.input<typeof updateResourceInputSchema>;
  "survey.updateSurveyResponse": z.input<typeof updateSurveyResponseInputSchema>;
  "webpage.saveResourceContent": ResourceContentSaveInput<
    (typeof ResourceDefinitionMap)[ResourceType.Webpage]["contentSchema"]
  >;
}

// A resource's save input is its own content schema under the shared save schema, so each save path reads through here
interface ResourceContentSaveInput<TContentSchema extends z.ZodType> {
  content: z.input<TContentSchema>;
  contentVersion: ResourceInResource["contentVersion"];
  id: ResourceInResource["id"];
}
