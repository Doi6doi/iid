
import { Iid } from "./Iid.js";
import { IidTools } from "./IidTools.js";

/// IID-related errors
export class IidError extends Error {

   /// expired session (or other)
   static expired() {
      return new IidError( Iid.EEXPIRED );
   }

   /// missing field
   static missing( field ) {
      return new IidError( Iid.EMISSING, {[Iid.FIELD]:field} );
   }

   /// network error
   static network( reason ) {
      return new IidError( Iid.ENETWORK, {[Iid.REASON]:reason} );
   }

   /// insufficient permission
   static permission() {
      return new IidError( Iid.EPERMISSION );
   }

   /// requires browser redirect
   static redirect( url, nonce=undefined ) {
      let args = {[Iid.URL]: url };
      if (nonce)
         args[Iid.NONCE] = nonce;
      return new IidError( Iid.EREDIRECT, args );
   }

   /// operation refused
   static refuse( reason ) {
      return new IidError( Iid.EREFUSE, {[Iid.REASON]:reason} );
   }

   /// syntax error
   static syntax( reason ) {
      return new IidError( Iid.ESYNTAX, {[Iid.REASON]:reason} );
   }

   /// unknown field value
   static unknown( field, value ) {
      return new IidError( Iid.EUNKNOWN,
         {[Iid.FIELD]:field, [Iid.VALUE]:value });
   }

   /// Readable form
   static asMessage( e ) {
      if ( e instanceof IidError ) {
         let a = e.args;
         switch (e.err) {
            case Iid.EEXPIRED: return "Expired";
            case Iid.ENETWORK: return "Network error: "+a[Iid.REASON];
            case Iid.EPERMISSION: return "Not permitted";
            case Iid.EUNKNOWN: return "Unknown field value ("
               +a[Iid.FIELD]+"): "+a[Iid.VALUE];
            case Iid.EREFUSE: return "Operation refused: "+a[Iid.REASON];
            case Iid.EMISSING: return "Missing data: "+a[Iid.FIELD];
            default: return ""+e.err+":"+JSON.stringify(e.args);
         }
      } else if ( e instanceof Error ) {
         return e.message;
      } else {
         return ""+e;
      }
   }

   /// dict form
   static asDict( e ) {
      let ret = {};
      if (e instanceof IidError) {
         if ( e.args )
            ret = e.args;
         ret[Iid.ERROR] = e.err;
      } else {
         ret = e;
      }
      return ret;
   }

   constructor(err, args={}) {
      super();
      this.err = err;
      if ( ! IidTools.isObject(args) ) {
         if ( args )
            args = {[Iid.MESSAGE]:args};
            else args = {};
      }
      this.args = args;
      this.name = "IidError";
      this.message = this._getMessage();
   }

   /// argument by name
   arg( name ) {
      return this.args[name];
   }

   /// get initial message
   _getMessage() {
      let ret = [];
      if ( this.err )
         ret.push( this.err );
      let msg = this.args[Iid.MESSAGE];
      let n = Object.keys(this.args).length;
      if ( msg && 1 == n ) {
         ret.push( msg );
      } else if ( n ) {
         ret.push( JSON.stringify( this.args ));
      }
      return ret.join(": ");
   }

}
