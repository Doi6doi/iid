

/// IID related constants and basic functions
export class Iid {

   static DIID =  "#diid.iid";
   static DNAME =  "#diid.name";
   static DPASSWORD =  "#diid.password";

   static EEXPIRED = "#eiid.expired";
   static EINCORRECT = "#eiid.incorrect";
   static EMISSING = "#eiid.missing";
   static ENETWORK = "#eiid.network";
   static EPERMISSION = "#eiid.permission";
   static EREDIRECT = "#eiid.redirect";
   static EREFUSE = "#eiid.refuse";
   static ESYNTAX = "#eiid.syntax";
   static EUNKNOWN = "#eiid.unknown";

   static MDATA = "#miid.data";
   static MSETDATA = "#miid.setdata";
   static MLOGIN = "#miid.login";
   static MPING = "#miid.ping";

   static ACTION = "action";
   static AT = "at";
   static ERROR = "error";
   static FIELD = "field";
   static FROM = "from";
   static MESSAGE = "message";
   static NONCE = "nonce";
   static REASON = "reason";
   static TO = "to";
   static URL = "url";
   static VALUE = "value";

   static VERIFYSSL = "verifyssl";

   /// IID call
   static call( url, req, extra = {} ) {
      return IidTools.fetchJson( url, req, extra );
   }

   /// IID call returning value
   static callVal( url, req, extra = {} ) {
      return Iid.checkVal( Iid.call( url, req, extra ));
   }

   /// Return value from response or throw error
   static checkVal( res ) {
      if ( ! IidTools.isObject( res ))
         throw IidError.syntax( "Not an object" );
      let e = res[Iid.ERROR];
      if ( e ) {
         if ( IidTools.isObject(e))
            throw new IidError( e[Iid.ERROR], e );
         else if ("#e" == e.slice(0,2))
            throw new IidError( e );
         else
            throw new IidError( null, e );
      }
      return Iid.checkField( res, Iid.VALUE );
   }

   /// Check field and return value
   static checkField( obj, fld ) {
      if ( ! Object.hasOwn(obj, fld) )
         throw IidError.missing( fld );
      return obj[fld];
   }

}

