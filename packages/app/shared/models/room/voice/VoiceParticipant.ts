import type { Session, User } from "better-auth";

export interface VoiceParticipant extends Pick<User, "image" | "name"> {
  id: Session["id"];
  isMuted: boolean;
  userId: User["id"];
}
