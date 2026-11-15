// The classes a card in the carousel's stack takes, each one an animation in the component's stylesheet
export const CardStackClass = {
  Active: "active-card",
  Inactive: "inactive-card",
  Normal: "normal-card",
  NormalEven: "normal-card-even",
  NormalOdd: "normal-card-odd",
  Overflow: "of-card",
} as const;
export type CardStackClass = (typeof CardStackClass)[keyof typeof CardStackClass];
