import { IidStorage } from "./IidStorage.js";

// In-memory storage for IID server
export class IidMemStorage extends IidStorage {

   constructor() {
      super();
      this.props = {};
   }

   prop( fld ) { return this.props[fld]; }

   setProp( fld, val ) { this.props[fld] = val; }


}
