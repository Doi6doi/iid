import { IidError } from "./IidError.js";
import { IidStorage } from "./IidStorage.js";

/// an IID Server stub
export class IidServer {

   static STORAGE = "storage";

   constructor(pars) {
      this.store = pars[IidServer.STORAGE];
      this.peer = null;
      this.mid = null;
   }

   /// process a request
   process( request ) {
      try {
         this.checkRequest( request );
         let ret = this.doProcess( request );
         return this.response({[Iid.VALUE]:ret});
      } catch (e) {
         return this.errResponse(e);
      }
   }

   /// do process a request
   doProcess( request ) {
      let a = request[Iid.ACTION];
      switch (a) {
         case Iid.MPING: return this.ping();
         default: throw IidError.unknown(Iid.ACTION,a);
      }
   }

   /// check if request is correct
   checkRequest( request ) {
      this.peer = request[ Iid.FROM ];
      this.mid = request[ Iid.MID ];
      if ( ! this.peer )
         throw IidError.missing( Iid.FROM );
      let sign = request[ Iid.SIGN ];
      if ( sign )
         this.checkSign( request, sign );
   }

   /// ping
   ping() { return true; }

   /// current timestamp
   at() { return Date.now() / 1000; }

   /// response
   response( ret ) {
      ret[Iid.AT] = this.at();
      ret[Iid.FROM] = this.store.prop( IidStorage.OWNIID );
      ret[Iid.TO] = this.peer;
      return ret;
   }

   /// error response
   errResponse(e) {
      let r;
      if (e instanceof IidError)
         r = IidError.asDict( e );
      else if (e instanceof Error)
         r = e.message;
      else
         r = e;
      return this.response({[Iid.ERROR]:r});
   }


}
