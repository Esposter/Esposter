import { z } from "zod";

// What a member of a scene group is, each kind named by its own table: an NPC, a gadget (a viewpoint's among them) or a
// Trigger a quest fires. A group's monsters and regions are held only by its script, so no member is either yet
export enum SceneGroupMemberKind {
  Gadget = "Gadget",
  Npc = "Npc",
  Trigger = "Trigger",
}

export const sceneGroupMemberKindSchema = z.enum(SceneGroupMemberKind) satisfies z.ZodType<SceneGroupMemberKind>;
