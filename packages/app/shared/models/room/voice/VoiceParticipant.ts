import type { User } from "@esposter/db-schema";

export interface VoiceParticipant extends Pick<User, "id" | "image" | "name"> {
  isMuted: boolean;
}
