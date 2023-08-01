import { v4 as uuidv4 } from "uuid";

export class Survey {
  id = uuidv4();
  name = "Unnamed";
  group?: string;
  model: object = {};
  createdAt = new Date();
  updatedAt = new Date();

  constructor(init?: Partial<Survey>) {
    Object.assign(this, init);
  }
}
