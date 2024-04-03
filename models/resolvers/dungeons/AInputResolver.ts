import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
// @TODO: Add GetAll{Scene}InputResolvers once es decorators gets implemented
export abstract class AInputResolver {
  // This is named "handleInputPre" instead of "handlePreInput"
  // because we're still handling the input and won't proceed to
  // call "handleInput" if it successfully handles the input
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleInputPre(justDownInput: PlayerInput, input: PlayerInput): boolean | Promise<boolean> {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleInput(justDownInput: PlayerInput, input: PlayerInput): boolean | Promise<boolean> {
    return false;
  }
}
