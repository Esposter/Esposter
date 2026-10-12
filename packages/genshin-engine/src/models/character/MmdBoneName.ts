// The standard names MMD gives a model's bones in Japanese, which every PMX model holds under the same names, so the
// Pose finds each by its name and skips any bone a model does not have
export enum MmdBoneName {
  Center = "センター",
  Upper = "上半身",
  Upper2 = "上半身2",
  Lower = "下半身",
  Neck = "首",
  Head = "頭",
  LeftShoulder = "左肩",
  RightShoulder = "右肩",
  LeftArm = "左腕",
  RightArm = "右腕",
  LeftElbow = "左ひじ",
  RightElbow = "右ひじ",
  LeftWrist = "左手首",
  RightWrist = "右手首",
  LeftLeg = "左足",
  RightLeg = "右足",
  LeftKnee = "左ひざ",
  RightKnee = "右ひざ",
  LeftAnkle = "左足首",
  RightAnkle = "右足首",
}
