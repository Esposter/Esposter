// The owner-side participant map — the owner client already sees its own audience data, so pairing the
// Key value with its token is safe here. Only the token ever reaches a URL
export interface ProgramParticipant {
  keyValue: string;
  token: string;
}
