// How one character is spoken: the service's voice and the adjustments a card makes to it. Every field is a string
// The speech markup takes verbatim, and "" is a field the card left unsaid rather than a value chosen for it
export interface SpeechVoice {
  // The voice's short name, which also carries the locale the markup is spoken under
  name: string;
  // A baseline pitch as a signed percentage or a semitone count, within half to one and a half times the voice's own
  pitch: string;
  // A speaking rate as a signed percentage, within half to twice the voice's own
  rate: string;
  // A style the voice itself declares; a style it does not declare drops the whole expression back to neutral
  style: string;
  // How far the style is pushed, from 0.01 to 2, where 1 is the style at the strength the voice defines it
  styleDegree: string;
}
