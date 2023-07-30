import { v4 as uuidv4 } from "uuid";

export class Survey {
  id = uuidv4();
  name = "Unnamed";
  createdAt = new Date();
  updatedAt = new Date();
}
