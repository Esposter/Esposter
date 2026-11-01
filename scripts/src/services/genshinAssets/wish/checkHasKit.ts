import { CharacterIdCreateKitBehaviourMap } from "genshin-world";

// Whether a character id has a kit of its own, the record a playable character is read by
export const checkHasKit = (id: number): boolean => Object.hasOwn(CharacterIdCreateKitBehaviourMap, id);
