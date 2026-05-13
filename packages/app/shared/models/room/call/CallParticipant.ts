import type { Session, User } from "better-auth";

export interface CallParticipant extends Pick<User, "image" | "name"> {
  id: Session["id"];
  isCameraEnabled: boolean;
  isMuted: boolean;
  userId: User["id"];
}
