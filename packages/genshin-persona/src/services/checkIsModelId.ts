// A model on the viewer is a whole number from zero, as the verb takes it and the file holds it
export const checkIsModelId = (modelId: number): boolean => Number.isInteger(modelId) && modelId >= 0;
