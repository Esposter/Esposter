/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
// @TODO: Add GetAll{Scene}InputResolvers once es decorators gets implemented
export abstract class AInputResolver {
  // This is named "handleInputPre" instead of "handlePreInput"
  // because we're still handling the input and won't proceed to
  // call "handleInput" if it successfully handles the input
  handleInputPre(justDownInput: PlayerInput, input: PlayerInput): boolean | Promise<boolean> {
    return false;
  }

  handleInput(justDownInput: PlayerInput, input: PlayerInput): boolean | Promise<boolean> {
    return false;
  }
}
