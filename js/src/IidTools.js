export class IidTools {

   static HEADS = "heads";
   static VERIFYSSL = "verifyssl";

   /// Is x an object
   static isObject( x ) {
      return typeof x === "object" && x !== null && ! Array.isArray(x);
   }

   /// json call to url
   static async fetchJson( url, req, extra={} ) {
      let data = JSON.stringify(req);
      IidTools.setHead( extra, "Content-Type","aplication/json" );
      let ret = await IidTools.fetch( url, data, extra );
      try {
         return JSON.parse( ret );
      } catch (e) {
         throw IidError.syntax( e.message );
      }
   }

   /// call to url
   static async fetch( url, data, extra={}) {
      let res;
      try {
         res = await fetch(url,{
            method: data ? "POST": "GET",
            headers: extra[ IidTools.HEADS ],
            body: data,
            dispatcher: false === extra[ IidTools.VERIFYSSL ] ?
               undefined : IidTools.insecure()
         });
      } catch (e) { throw IidError.network( e.message ); }
      let text = await res.text();
      if ( ! res.ok )
         throw IidError.network( ""+res.status+": "+text );
      return text;
   }

   /// set header in extra
   static setHead( extra, field, value ) {
      if ( ! extra[ IidTools.HEADS ] )
         extra[ IidTools.HEADS ] = {};
      extra[IidTools.HEADS][field] = value;
   }

   /// Insecure dispatcher
   static insecure() { return undefined; }

}
