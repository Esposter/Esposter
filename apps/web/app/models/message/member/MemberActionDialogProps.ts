import type { MemberActionTarget } from "#src/models/message/member/MemberActionTarget";

// The props a member action dialog takes when it acts inside a room: the member it acts on and the room it acts in
export interface MemberActionDialogProps extends MemberActionTarget {
  roomId: string;
}
