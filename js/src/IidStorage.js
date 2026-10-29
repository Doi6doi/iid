// Base class for storing IidServer data
export class IidStorage {

   static OWNIID = "owniid";

   /// get server property
   prop( fld ) { return undefined; }

   /// set server property
   setProp( fld, val ) {
      throw "Cannot set property: "+fld;
   }

}
