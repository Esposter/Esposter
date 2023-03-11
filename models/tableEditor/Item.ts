import { v4 as uuidv4 } from "uuid";

export class Item {
  id = uuidv4();
  name = "Unnamed";
}
