// How one character is spoken: the service's voice and whatever adjustment a card makes to it. An absent field is
// An adjustment the card did not make, so the voice keeps its own — never a number chosen on its behalf
export interface SpeechVoice {
  // The voice's short name, which also carries the locale the markup is spoken under. It is not checked against a
  // Catalogue here: the service gains and retires voices on Microsoft's schedule, so the `voices` command asks the
  // Live list instead of a copy that would be wrong by the next patch
  name: string;
  // A signed percentage, which the service clamps to within half to one and a half times the voice's own
  pitch?: number;
  // A signed percentage, which the service clamps to within half to twice the voice's own
  rate?: number;
  // A style the voice itself declares; a style it does not declare drops the whole expression back to neutral
  style?: string;
  // From 0.01 to 2, where 1 is the style at the strength the voice defines it
  styleDegree?: number;
}
