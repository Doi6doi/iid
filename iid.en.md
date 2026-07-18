---
title: Internet Identity Protocol (IID)
abbrev: IID Protocol
docname: draft-varnagy-iid-protocol-00
category: info
submissionType: independent
ipr: trust200902
area: General
workgroup: Independent Submission

keyword: 
   - identity
   - authentication
   - message
   - signature

author:
   -
      ins: Z.Varnagy
      fullname: Várnagy Zoltán
      organization: Independent
      email: doi6doi@gmail.com

normative:
  RFC2119:
  RFC8174:
  RFC8259:
  UAX15:
    target: https://www.unicode.org/reports/tr15/
    title: "Unicode Standard Annex #15: Unicode Normalization Forms"
    author:
      org: The Unicode Consortium
  RFC8785:
  RFC4648:
  FIPS180-4:
    target: https://doi.org/10.6028/NIST.FIPS.180-4
    title: "Secure Hash Standard (SHS)"
    author:
      org: National Institute of Standards and Technology (NIST)
    date: 2015-08
  FIPS202:
    target: https://doi.org/10.6028/NIST.FIPS.202
    title: "SHA-3 Standard: Permutation-Based Hash and Extendable-Output Functions"
    author:
      org: National Institute of Standards and Technology (NIST)
    date: 2015-08
  RFC8032:
  RFC7693:
  FIPS186-5:
    target: https://doi.org/10.6028/NIST.FIPS.186-5
    title: "Digital Signature Standard (DSS)"
    author:
      org: National Institute of Standards and Technology (NIST)
    date: 2023-02
  RFC8017:
  RFC1321:
  ISO13239:
    target: https://www.iso.org/standard/37010.html
    title: "Information technology -- Telecommunications and information exchange between systems -- High-level data link control (HDLC) procedures"
    author:
      org: International Organization for Standardization
  ISO3166:
    target: https://www.iso.org/standard/72482.html
    title: "Codes for the representation of names of countries and their subdivisions -- Part 1: Country codes"
    author:
      org: International Organization for Standardization
  SP800-38D:
    target: https://csrc.nist.gov/pubs/sp/800/38/d/final
    title: "Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC"
    author:
      org: National Institute of Standards and Technology (NIST)
    date: 2007-11
  FIPS197:
    target: https://doi.org/10.6028/NIST.FIPS.197-upd1
    title: Advanced Encryption Standard (AES)
    author:
      org: National Institute of Standards and Technology (NIST)
    date: 2023-05

informative:
  RFC1034:
  RFC5891:
  RFC9110:
  RFC8615:
  RFC2045:
  RFC5646:
  RFC9112:
  RFC9293:

--- abstract 

This document specifies the IID protocol, which defines
message formats and operations for managing personal data,
permissions, and attributes associated with internet identities, 
including natural persons, organizations and artificial intelligence 
agents.

The protocol is designed to be simple, extensible, platform-independent,
and human readable. It is transport-agnostic and supports arbitrary
cryptographic algorithms.

--- middle

# Requirements Language

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", 
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in 
this document are to be interpreted as described in BCP 14 {{RFC2119}} {{RFC8174}}
when, and only when, they appear in all capitals, as shown here.

# IANA Considerations

This document requests no IANA actions. Future standards-track versions of 
this protocol MAY request registration of the /.well-known/iid URI in accordance 
with {{RFC8615}}.

# Introduction

Currently, there is no single, unified protocol designed to manage
comprehensive internet identity functions in a general and uniform manner.
Existing methods for distinct identity-related tasks - such as 
authentication, personal data sharing, consent management, and digital
signatures - rely on disparate, ad-hoc solutions. These separate systems
offer only partial compatibility and limited interoperability with one another.

# Objectives

The primary objective of the protocol is to provide a uniform framework for
the identity-related operations, including:

   - Authentication (sign-in, SSO)
   - Personal data sharing
   - Consent management (granting and revoking permissions)
   - Data attestation and third-party verification
   - Digital signatures
   - Future protocol extensions

The protocol is designed to be inherently simple and human-readable.

It must remain platform-independent, ensuring straightforward implementation
across any programming language.

To remain adaptable to both current and future environments, the protocol
must not impose restrictions on the specific transport layer or cryptographic
algorithm used.

# Basic idea

The fundamental idea is to define the messages in a JSON-based format {{RFC8259}}.
The exact method of transporting these messages (such as HTTPS {{RFC9110}} {{RFC9112}} 
or TCP {{RFC9293}}) is outside the scope of this protocol.

Messages are exchanged between internet identities. They MAY contain
a timestamp indicating when they were sent, the identifiers of the sender and recipient, 
and data required to verify their digital authenticity.

# Terminology

internet identity
: An entity capable of communicating over the internet, 
   such as a natural person, organization, server, web crawler or AI agent.

identity server (IID server)
: A server that manages the data and operations associated with an internet identity.

internet identifier (IID)
: A globally unique identifier consisting of a local name and a domain 
   name separated by `@`. Similar to an e-mail address. (for example `foo@bar.org`)

IID message
: A request or response exchanged between internet identities.

sender
: Depending on the context, either the IID in the from field of a message, 
   or the identity server acting on behalf of that identity.

receiver
: The identity server that receives and processes an IID message.

recipient
: The IID in the to field of a message.

# Protocol

## Protocol scheme

The protocol assumes an already established transport connection 
between a sender and a receiver. In most cases both are identity servers 
representing the sender and recipient IIDs, 
but messages MAY also be relayed through intermediaries.

Communication starts with a request sent by the sender. Each request
receives exactly one response from the receiver. 
The sender MAY continue sending further requests, each of which
receives a response in the same order.

Either party MAY close the connection at any time. Closing the connection 
cancels any outstanding requests.

## Special JSON strings

Fundamentally, the IID protocol operates on JSON data {{RFC8259}}.
To extend the capabilities of JSON, certain string values have 
special meanings:

String beginning with # are interpreted specially. An implementation MUST recognize these 
values, for example by performing an additional processing pass after parsing the JSON data,
or before serializing data to JSON. 

 - `##...` : A JSON string that begins with `#`, with the first `#` removed (e.g., `##foo` -> `#foo`)
 - `#6...` : Base64-encoded binary data {{RFC4648}} without line breaks or padding (e.g., `#6WA`)
 - `#x...` : Hex-encoded binary data using lowercase hexadecimal digits (e.g., `#x585a`) 
 - `#e...` : Error token (e.g., `#eiid.missing`)
 - `#m...` : Action (method) token (e.g., `#miid.weblogin`)
 - `#a...` : Algorithm token. (e.g., `#aiid.md5`)
 - `#k...` : Key format token (e.g.m `#kiid.rsa.2048`)
 - `#r...` : Requirement token (e.g., `#riid.at`)
 - `#d...` : Data token (e.g., `#diid.zip`)
 - `#v...` : Value token (e.g., `#viid.firm`)

## JSON objects

IID messages use JSON format, and every message is represented as a 
JSON object {{RFC8259}}. The structure of these messages and their 
components is defined in later sections.

Any JSON object MAY contain additional fields. If a server or client does not
understand a message or some of its parts, it MAY either ignore
the unrecognized part or return an appropriate error token to the sender.

If a server requires a field and it is not present, it MUST
return an error token.

## Type syntax

The following type syntax is used throughout this document. 

Normalized strings:

All strings in JSON data MUST be normalized using Unicode
Normalization Form C (NFC) {{UAX15}}.

### Basic types

   - `%null%`: The `null` value
   - `%bool%`: Boolean value (`true`/`false`)
   - `%nat%`: Natural number (integer greater than or equal to `0`)
   - `%int%`: Integer
   - `%num%`: Integer or floating point value
   - `%ascii%`: ASCII text (`[0x20-0x7e]+`)
   - `%str%`: Unicode text (with NFC)
   - `%stamp%`: UTC Unix timestamp in seconds (integer)
   - `%iid%`: Internet identifier (e.g., `foo@bar.org`, see details later)
   - `%date%`: Date without time or timezone (`YYYYMMDD`)
   - `%country%`: Country code {{ISO3166}}
   - `%phone%`: Phone number (`+?[0-9]{3,}`)
   - `%lang%`: Language code {{RFC5646}}
   - `%bin%`: Binary data (e.g., Base-64 or hexadecimal-encoded) 
   - `%url%`: URL (e.g., `https://foo.org`)
   - `%obj%`: JSON object with arbitrary fields
   - `%#...%`: Token or fix token value
   - `%any%`: Any value

New types can be defined from existing types in the following ways.

### Union
~~~
   %a% | %b% | %c%
~~~
   A value of any of the listed types

### Array
~~~
    [%t%]
~~~
   An array whose elements are of type `%t%`.

### Array or item
~~~
   {%t%}
~~~
  A value of type `%t%`, or an array whose elements are of type `%t%`.

### Inheritance
~~~
    %a% {
       !f1: %t1% - comment1
       f2: %t2% - comment2
       ...
    }
~~~
   An object that extends `%a%`. MAY contain all the fields of `%a%`,
   together with field `f1` of type `%t1%` (meaning `comment1`), field `f2`
   of type `%t2%` (meaning `comment2`) and so on.

   If a field name is prefixed with `!`, it is the default field.
   In that case the type also allows a scalar value instead of
   an object. Such value  MUST be interpreted as an object
   containing only the default field with the specified value.

## IID types

### Identity (%iid%)

An Internet Identifier (IID) MUST consist of a local part, the `@` symbol and a
domain part. It MUST be in normalized (NFC) form. Any unicode characters are allowed
in the local and domain parts, except the following ones:

   - at sign: `@` (\u40)
   - control characters: (\u00-\u1f)
   - space (\u20)
   - brackets: `()[]{}` (\u28,\u29,\u5b,\u5d,\u7b,\u7d)
   - quotation mark: `"` (\u22)
   - question mark: `?` (\u3f)
   - semicolon: `;` (\u3b)
   - backslash: `\` (\u5c)

IID-s are case-sensitive. Two IIDs are equal if and only if all 
their Unicode code points are identical.

### Message (%iid.message%)

A general message, which can be exchanged between internet identities.

~~~
%iid.message% : %obj% {
   at: %stamp% - Time the message was sent
   from: %iid.subject% - Sender
   to: %iid.subject% - Recipient
   error: %iid.error% - Error. If present, 
      the preceding request MUST be considered to have failed.
   mid: %ascii% - Message identifier
   sign: {%iid.sign%} - Digital signature
   encrypted: %iid.encrypted% - Encrypted data
}
~~~

### Subject (%iid.subject%)

Identifies an internet identity. In most cases this is an internet identifier, but it MAY 
also be another form of identification.

~~~
%iid.subject% : %iid% | %obj%
~~~

### Error (%iid.error%)

Represents an error that occurred during message exchange. It can indicate
a syntax error in the preceding message, invalid data values, insufficient
permissions, an invalid signature, or any other error condition.
Common error tokens are defined in a later section.

In most cases, an error is represented by an error token.
If additional information is available (such as error message), 
the object form can be used.

~~~
%iid.error% : %obj% {
   !error: %#e%
   message: %str% - Human-readable error message
}
~~~

Additional fields MAY be present.

### Signature (%iid.sign%)

Represents a digital signature. If the ref field is not present, the signature 
applies to the object that contains it. The signed data is the JCS
representation of that object with the sign field omitted {{RFC8785}}.
All binary data MUST use the Base64 (`#6...`) notation without line breaks 
and without padding.

An object MAY be signed by multiple keys owned by different internet identities. 
In that case, the sign field contains an array of `%iid.sign%` objects.

If multiple signatures are present, the signature set is considered valid 
only if all signatures are valid.

~~~
%iid.sign% : %obj% {
   owner: %iid.subject% - Signer
   key: %iid.key% - Key used for signing
   algo: %iid.algo% - Algorithm used for signing
   ref: %iid.dataref% - Reference to signed data 
      (e.g., identifier, a hash, URL, etc...)
   sign: %bin% - Digital signature value
}
~~~

### Encrypted data (%iid.encrypted%)

If the transfer channel is not considered secure, or the transmitted data 
requires additional protection, a message MAY be encapsulated in this form.
Fields omitted from the encrypted object MAY be inherited from the
containing object or from the transfer context.

The encoding of the data field is defined by the selected 
encryption algorithm.

~~~
%iid.encrypted% : %obj% {
   !data: %bin% - Encrypted binary data
   owner: %iid.subject% - Owner of the decryption key
   key: %iid.key% - Decryption key
   algo: %iid.algo% - Encríption algorithm
}
~~~

### Key (%iid.key%)

Represents a signing or encryption key. In most cases, only the
key name is used, while the remaining key properties (such as pub, algo, and until)
can be obtained from the key owner's identity server. 
A key is globally identified by the owner's IID and the key name.

An identity server MAY revoke, for example in the event of key compromise.
Once a key has been revoked, the until field MUST NOT be returned.
Instead, the revoked field MUST be present and indicate the time at which
the key was revoked.

In the event of key compromise, the revoked timestamp SHOULD indicate
the latest estimated time before the key was compromised.

Any signature or data encryption after the revoked timestamp MUST be considered invalid.

An identity server MUST NOT generate signatures or encrypt data using a revoked key.

~~~
%iid.key% : %obj% {
   !name: %str% - Name of the key 
      (issued by the identity server or the identity)
   format: %#k% - Key format (e.g., `#kiid.rsa.2048`)
   pub: %bin% - Public part of the key
   from: %stamp% - Start of valid period
   until: %stamp% - End of valid period
   revoked: %stamp% - Time of key revoke
}
~~~
 
### Reference (%iid.ref%)

References a piece of data or a document. 

It can be a single identifier, defined by the current context,
or a custom object with values, like an IID message.

~~~
%iid.ref% : %str% | %obj%
~~~

### Data reference (%iid.dataref%)

Reference to some kind of binary data.

If a single identifier is used, the meaning is determined by the context.

When the object form is used, its fields identify the data. 
All specified field values SHOULD match the referenced data.

~~~
%iid.dataref% : %obj% {
   !id: %str% - Data identifier
   name: %str% - Data name
   filename: %str% - Filename
   mime: %ascii% - MIME content type (RFC2045)
   hash: {%iid.hash%} - Computed hash values
}
~~~
{{RFC2045}}

### Algorithm (%iid.algo%)

References a cryptographic algorithm. In simple cases, only a token is used
(like `#aiid.md5`). The object form can be used if the algorithm requires
additional parameters.

~~~
%iid.algo% : %obj% {
   !algo: %#a%
}
~~~

### Request (%iid.request%)

An IID request sent to another internet identity. 
Every request expects exactly one response.

~~~
%iid.request% : %iid.message% {
   action: %#m% - Requested action
   params: %any% - Action parameters
   requirement: {%iid.requirement%} - Response requirements
}
~~~

### Response (%iid.response%)

Represents the response to a request.

~~~
%iid.response% : %iid.message% {
   ref: %iid.ref% - Reference to the request 
      (e.g., message identifier or hash)
   value: %any% - Result of the requested action
   requirement: {%iid.requirement%} - Requirements for 
      the following requests
}
~~~

### Hash value (%iid.hash%)

A hash, checksum or other value computed from data.

~~~
%iid.hash% : %obj% {
   algo: %iid.algo% - Algorithm used
   value: %bin% | %nat% - Computed value
}
~~~

### Requirement (%iid.requirement%)

Specifies a requirement that applies to a follow-up message.
In most cases, the requirement is represented by a single requirement token, 
but the object form MAY be used when additional parameters are required.

~~~
%iid.requirement% : %obj% {
   !requirement: %#r% - Requirement token
}
~~~

### Identity kind (%iid.idkind%)

Represents the kind of the internet identity, such as a person or a web crawler. 
The possible values are defined in a later section.

~~~
%iid.idkind% : %#d%
~~~

### Image (%iid.image%)

Represents a bitmap or vector graphics. Usually an URL is sufficient,
but in object form, more properties can be present.

~~~
%iid.image% : %obj% {
   !url: %str% - URL of image
   name: %str% - Name of the image
   aspect: %num% - Aspect ratio of image
   width: %nat% - Image width in pixels
   height: %nat% - Image height in pixels
   mime: %ascii% - MIME content type (RFC2045)
   data: %bin% - Image binary data
}
~~~
{{RFC2045}}

## Tokens

The protocol defines some tokens for basic functionality. (`#a...`, `#e...`)
This document describes tokens in the iid. namespace. Other namespaces
MAY also be used, those can be defined in protocol extensions,
or by the identity servers themselves.

### Error tokens

 - `#eiid.json`: JSON syntax error in incoming message
 - `#eiid.time`: Message timestamp drifts significantly (too far in past or future)
 - `#eiid.repeat`: Repeat the request while fulfilling the specified requirements
 - `#eiid.sign`: The digital signature is invalid (revoked, expired, incorrect, etc...)
 - `#eiid.noverify`: Cannot verify the validity of the request 
 - `#eiid.incorrect`: Action is refused becasue of incorrect data (e.g., password)
 - `{ error:#eiid.refuse, reason:%any% }`: The requested action was refused with a reason
 - `{ error:#eiid.size, limit:%nat% }`: Message size exceeds the permitted limit
 - `{ error:#eiid.missing, field:%str% }`: A required field is missing
 - `{ error:#eiid.unknown, field:%str%, value:%any% }`: An unknown or unsupported field value was encountered
 - `{ error:#eiid.later, after:%stamp% }`: Temporary rejection. The request may be repeated later
 - `{ error:#eiid.redirect, url:%str% }`: Redirect the user's browser to the specified URL

### Action (method) tokens

 - `#miid.login`: Request or confirm authentication (sign-in) to a system
 - `#miid.data`: Retrieve attributes and data associated with the identity
 - `#miid.consent`: Request to grant permission for a specific operation (e.g., cookie usage)
 - `#miid.message`: Transmit an instant message
 - `#miid.sign`: Request a digital signature on a document or data payload
 - `#miid.testify`: Attest to or verify the validity of a specific data point or state
 - `#miid.revoke`: Revoke a previously granted consent or permission to store data
 - `#miid.key`: Retrieve the public cryptographic keys of the identity

### Key format tokens

A single-word identifier usually denotes a key format family. 
More specific formats are identified by 
dot-separated suffixes (e.g., `#kiid.rsa.2048`). 

 - `#kiid.rsa`: {{RFC8017}}
 - `#kiid.ecdsa`: {{FIPS186-5}}
 - `#kiid.ed25519`: {{RFC8032}}

 - `#kiid.rsa.2048`: 2048 bit RSA key
 - `#kiid.rsa.3072`: 3072 bit RSA key
 - `#kiid.rsa.4096`: 4096 bit RSA key

 - `#kiid.ecdsa.p256`: ecdsa p-256 curve key

### Algorithm tokens

Hash algorithms and checksums. 

A single-word identifier usually denotes an algorithm family. 
More specific algorithms are identified by 
dot-separated suffixes (e.g., `#aiid.sha.256`). 
If an algorithm is composed of multiple components, 
the components are separated by dashes 
(e.g., `#aiid.ecdsa.p256-sha.256`).

 - `#aiid.size`: Data size in bytes
 - `#aiid.crc`: {{ISO13239}}
 - `#aiid.md5`: {{RFC1321}}
 - `#aiid.sha`: {{FIPS180-4}}
 - `#aiid.sha3`: {{FIPS202}}
 - `#aiid.blake2`: {{RFC7693}}

 - `#aiid.crc.32`: CRC-32
 - `#aiid.sha.256`: SHA-256
 - `#aiid.sha.384`: SHA-384
 - `#aiid.sha.512`: SHA-512
 - `#aiid.sha3.256`: SHA3-256
 - `#aiid.sha3.512`: SHA3-512

Encryption

 - `#aiid.rsa`: 
 - `#aiid.oaep`: {{RFC8017}}
 - `#aiid.aes`: {{FIPS197}}
 - `#aiid.gcm`: {{SP800-38D}}

 - `#aiid.oaep.256-gcm.256` : RSA-OAEP:SHA-256:MGF1(SHA-256) 
   with AES GCM 256 bit

Digital signature

 - `#aiid.ecdsa`: {{FIPS186-5}}
 - `#aiid.ed25519`: {{RFC8032}}
 - `#aiid.rsa.pkcs1`: {{RFC8017}}
 - `#aiid.rsa.pss`: {{RFC8017}}

 - `#aiid.ecdsa.p256-sha.256`: ecdsa p-256 with SHA-256

### Data tokens

 - `#diid.name`: Name
 - `#diid.fullname`: Full name
 - `#diid.givenname`: Given name
 - `#diid.familyname`: Family name
 - `#diid.nickname`: Nickname
 - `#diid.birthdate`: Birth date: `%date%`
 - `#diid.birthplace`: Birth place
 - `#diid.age`: Age: `%nat%`
 - `#diid.adult`: Indicates whether the identity is of an adult: `%bool%`
 - `#diid.language`: Language: `{%lang%}`
 - `#diid.kind`: Identity kind: `%iid.idkind%`
 - `#diid.address`: Address: `{%str% | %obj%}`
 - `#diid.postaddress`: Postal address: `{%str% | %obj%}`
 - `#diid.country`: Country: `%country%`
 - `#diid.state`: State or province
 - `#diid.city`: City
 - `#diid.district`: District
 - `#diid.zip`: Postal code
 - `#diid.street`: Street
 - `#diid.house`: House number
 - `#diid.floor`: Floor
 - `#diid.door`: Door number
 - `#diid.email`: Email address
 - `#diid.phone`: Phone number: `{%phone%}`
 - `#diid.website`: Website URL
 - `#diid.taxid`: Tax Identifier
 - `#diid.personalid`: Personal identifier
 - `#diid.companyid`: Company identifier
 - `#diid.passport`: Passport number
 - `#diid.company`: Employer: `{%iid%}`
 - `#diid.department`: Department
 - `#diid.position`: Job title
 - `#diid.avatar`: Avatar image: `{%iid.image%}`

Special data tokens

 - `#diid.attester`: Identities that can attest to this identity's data: `{%iid%}`
 - `#diid.trusted`: Identities trusted by this identity: `{%iid%}`
 - `#diid.until`: Latest time until which the shared data can be used: `%stamp%`

### Value tokens

The following sections define some possible data value tokens

#### Identity kinds

 - `#viid.person`: Natural person
 - `#viid.firm`: Organization or company
 - `#viid.site`: Website
 - `#viid.crawler`: Web crawler
 - `#viid.aiagent`: AI agent

#### Operations for consent:

 - `#viid.newsletter`: Newsletter
 - `#viid.cookie.necessary`: Strictly necessary cookies
 - `#viid.cookie.session`: Session cookies
 - `#viid.cookie.marketing`: Marketing cookies
 - `#viid.cookie.analytics`: Analytics cookies
 - `#viid.cookie.third`: Third-party cookies

### Requirement tokens

 - `#riid.at`: The follow-up message MUST contain the at field
 - `#riid.from`: The follow-up message MUST contain the from field
 - `#riid.to`: The follow-up message MUST contain the to field
 - `#riid.mid`: The follow-up message MUST contain the message identifier
 - `#riid.sign`: The follow-up message MUST be digitally signed
 - `#riid.encrypted`: The follow-up message MUST be encrypted
 - `#riid.echo`: The entire request MUST be repeated in response's ref field
 - `{ requirement: #riid.key, key: {%iid.key%} }`: The follow-up message MUST use 
   one of the specified keys.
 - `{ requirement: #riid.algo, key: {%iid.algo%} }`: The follow-up message MUST use 
   one the specified algorithm.
 - `{ requirement: #riid.url, url: %str% }`: Following requests MUST use the specified URL

## Examples

This section presents examples of IID communication between identity servers 
in various scenarios. These examples are intended to demonstrate the 
capabilities and flexibility of the protocol. They are not normative specifications
of the described cases, which are specified in separate documents.

### Web login

John Doe (`john@doe.org`) visits a new website: `https://foo.org`. The website 
obtains his IID, for example from an HTTP header {{RFC9110}}, a cookie,
or by prompting the user. 

The `foo.org` server determines the identity server responsible for `john@doe.org`
and sends the following request to the designated endpoint:

~~~
foo.org >>> doe.org { 
   "from": "site@foo.org",
   "to": "john@doe.org",
   "action": "#miid.login",
   "params": {
      "returnurl":"https://foo.org/login"
   }
}
~~~

The `doe.org` identity server records that `foo.org` has requested 
a login. It generates a nonce value and responds that it wishes to 
identify the browser:

~~~
foo.org <<< doe.org {
   "error": { 
      "error": "#eiid.redirect",
      "url":"https://doe.org/login",
      "nonce": "12345678"
   }
}
~~~

The foo.org server records the nonce and 
redirects John's browser to `https://doe.org/login`.

If John is not already signed in to his identity server, he is prompted 
to authenticate. After that, the settings of his doe.org account determine 
whether any additional confirmation is required.

If not, the process continues immediately. The doe.org server redirects 
the browser back to `https://foo.org/login` which causes the following request to be sent:

~~~
foo.org >>> doe.org { 
   "from": "site@foo.org",
   "to": "john@doe.org",
   "action": "#miid.login",
   "params": {
      "nonce": "12345678"
   }
}
~~~

The `doe.org` server has already recorded that the login with the specified nonce 
has been authorized. It returns a positive response:

~~~
foo.org <<< doe.org {
   "value": true
}
~~~

At this point, the login is complete. The `foo.org` server signs John in and 
can present his personalized view. It only needs to store his IID;
any additional information can be retrieved from doe.org whenever needed.

Subsequent visits are even simpler. Since `foo.org` can store John's IID in
a cookie, it can contact `doe.org` without asking John his IID. While John
is still signed in to `doe.org`, and his account settings permit it,
the identity server can immediately return a positive response
without requiring further interaction.

Note: the above example assumes a Secure HTTPS transport. When a less secure
transport is used, or additional security is needed, the protocol
MAY require digitally signed and/or encrypted messages. 
See the *Security considerations* section for details.

### Fetch personal data

John (`john@doe.org`) visits a webshop. The webshop obtains his IID in the same way as
in the previous example. Since it needs to know where to ship John's order, it contacts
his identity server: `doe.org`. As a postal address is personal information, it signs
the request:

~~~
webshop.com >>> doe.org {
   "at": 1783473539,
   "from": "site@webshop.com",
   "to": "john@doe.org",
   "action": "#miid.data",
   "params": [
      "#diid.fullname",
      "#diid.postaddress"
   ],
   "sign": {
      "key":"req2026",
      "sign":"#6..."
   }
}
~~~

At this point, the doe.org identity server MAY retrieve the `req2026` key from 
`webshop.com` and verify the signature (see later). Depending on the settings of
`john@doe.org` it MAY authorize the data sharing immediately or 
redirect the browser to a confirmation page hosted by `doe.org`.

Assume that the requested data is authorized for sharing with `site@webshop.com`.
The identity server responds with the requested values and includes an until 
timestamp, after which the `site@webshop.com` SHOULD no longer retain
the shared data.

~~~
webshop.com <<< doe.org {
   "value": {
      "#diid.fullname":"John Doe",
      "#diid.postaddress": {
         "#diid.country":"US",
         "#diid.state":"New York",
         "#diid.zip":"10004",
         "#diid.street":"Liberty",
         "#diid.house":1
      },
      "#diid.until":1783559940
   }
}
~~~

The webshop receives John's postal address together with permission to retain 
it for one day. This is sufficient to ship the order.

### Consent

The webshop requests John's consent to send newsletters, and to store 
marketing cookies in his browser. Since it wishes to retain proof of
the consent (for example, for GDPR compliance), it requires the
response to include both a digital signature and an echo of the original
request.

~~~
webshop.com >>> doe.org {
   "at": 1783473639,
   "from": "site@webshop.com",
   "to": "john@doe.org",
   "action": "#miid.consent",
   "params": [
      "#viid.newsletter",
      "#viid.cookie.marketing"
   ],
   "requirement": [
      "#riid.sign",
      "#riid.echo"
   ]
}
~~~

Assume that the `john@doe.org` account is configured to allow
newsletters but not marketing cookies:

~~~
webshop.com <<< doe.org {
   "at": 1783473640,
   "value": {
      "#viid.newsletter":true,
      "#viid.cookie.marketing":false
   },
   "ref": {
      "at":1783473639,
      ...
   },
   "sign":{
       "key":"data2026",
       "sign":"#6..."
   }
}
~~~

### Revoking consent

John wishes to unsubscribe from the newsletter and orders the webshop to forget his phone number:

~~~
doe.org >>> webshop.com {
   "at": 1783473739,
   "from": "john@doe.org",
   "to": "site@webshop.com",
   "action": "#miid.revoke",
   "params": ["#viid.newsletter","#viid.phone"],
   "sign":{
      "key":"data2026",
      "sign":"#6..."
   }
}
~~~

The webshop verifies John's signature, unsubscribes him from the newsletter,
and deletes the stored phone number.

~~~
doe.org <<< webshop.com {
   "value": true
}
~~~

### Key fetch and attest

The `foo.org` website needs a verifiable confirmation that it
has the correct copy of John's public key. It sends a request 
to an attesting identity server:

~~~
foo.org >>> bar.org {
   "from": "site@foo.org",
   "to": "clerk@bar.org",
   "action": "#miid.testify",
   "params": {
      "iid": "john@doe.org",
      "key": "data2026",
      "until": 1798761600,
      "pub": "#xabcd..."
   },
   "requirement": [
      "#riid.sign",
      "#riid.at",
      "#riid.echo"
   ]
}
~~~

The `bar.org` server retrieves the key from `doe.org`. It requires 
the response to be signed using the same key:

~~~
bar.org >>> doe.org {
   "from": "clerk@bar.org",
   "to": "john@doe.org",
   "action": "#miid.key",
   "params": "data2026",
   "requirement": [
      {
         "requirement":"#riid.key",
         "key":"data2026"
      }
   ]
}
~~~

The `doe.org` identity server returns the key details and signs the response:

~~~
bar.org <<< doe.org {
   "at": 1783473841,
   "from":"john@doe.org",
   "value": {
      "name":"data2026",
      "algo":"#aiid.ed25519",
      "pub":"#xabcd...",
      "from": 1767225600,
      "until": 1798761600
   },
   "sign":{
      "key":"data2026",
      "sign":"#6..."
   }
}
~~~

The bar.org server verifies the signature. If it is valid, it knows that
the response was signed by the holder of the private key corresponding
to `data2026`. If the public key matches the
one supplied by `foo.org`, it returns a positive response:

~~~
foo.org <<< bar.org {
   "at": 1783473842,
   "value": true,
   "ref": {
      "from":"site@foo.org",
      ...
   },
   "sign":{
       "key":"att2026",
       "sign":"#6..."
   }
}
~~~

Based on the signed confirmation from `bar.org`, `foo.org` can trust that it has
the correct copy of John's public key. It MAY update the last verification timestamp
associated with John's key.

### Instant message

John wishes to send an instant message to a company:

~~~
doe.org >>> firm.org {
   "from": "john@doe.org",
   "to": "info@firm.org",
   "action": "#miid.message",
   "params": {
      "data": "Please, inform me of your current open positions.",
      "mime": "text/plain"
   }
}
~~~

The company accepts the instant message:

~~~
firm.org >>> doe.org {
   "value": true
}
~~~

# Implementation

This protocol does not define implementation details, 
but it provides some suggestions for implementing identity servers.

## DNS resolution

The IP address of an identity server SHOULD be obtained through DNS resolution of 
the domain part of the IID. For example, the server of `john@doe.org`
will have the IP resolved from `doe.org` {{RFC1034}}.

If the domain part of an IID contains characters which the DNS system cannot handle,
the resolution SHOULD be made in the IDNA format {{RFC5891}}.

## .well-known

The HTTPS server of the domain SHOULD have a `/.well-known/iid` endpoint {{RFC8615}}.
That endpoint MAY process IID requests directly or redirect clients to the actual 
endpoint by returning a response such as:

~~~
{
   "error":"#eiid.repeat",
   "requirement":{ 
      "requirement":"#riid.url", 
      "url":"https://foo.org/iid" 
   }
}
~~~

# Security considerations

In general, this protocol assumes that IID requests are transmitted over 
a secure, authenticated, and encrypted channel (such as HTTPS). 

The following examples consider three communication environments:

 - SAFE: Communication takes place over a secure channel where the 
      endpoints are authenticated and messages cannot be intercepted or modified.

 - KNOWN: The communicating parties have prior knowledge of each other's public keys.
      The communicating channel itself may be subject to interception or modification.

 - INSECURE: The communication channel can be intercepted or modified,
      and the parties have no prior knowledge of each other's public keys.

The examples in the following sections demonstrate these conclusions:

A SAFE environment provides adequate security for IID operations.

In a KNOWN environment, secure communication can be achieved using additional
cryptographic techniques.

In an INSECURE environment, IID alone cannot guarantee secure communication.
However an INSECURE environment can potentially be upgraded to a KNOWN one
through a *Trust chain discovery* mechanism, described later in this document.

## Altered sender identity

SAFE, KNOWN: If the sender's identity is important and uncertain, the receiver MAY
   require the request to be digitally signed. Successful signature verification
   authenticates the sender.

INSECURE: The sender's identity cannot be reliably authenticated.

## Altered recipient identity

SAFE: The channel guarantees that the request is delivered without modification.

KNOWN: The receiver MAY require the request to include the recipient's identity
   and to be digitally signed by the sender. Successful signature verification 
   ensures that no data got changed during the transfer.

INSECURE: The recipient identity cannot be guaranteed, as it may be modified 
   during transmission.

## Request replay

The receiver MAY require requests to include a timestamp. It MAY also limit
processing to at most one request per second for the same sender and recipient,
responding with `#eiid.later` to subsequent duplicates. this prevents
identical requests from being processed repeatedly.

In many cases authenticating the sender is more important than
preventing the same response from being returned multiple times.

SAFE: Replay attacks by third parties are prevented because requests
   cannot be intercepted.

KNOWN: After the sender has been authenticated, replayed requests usually do
   not present a security risk. If the timestamp is included in the signed content,
   modified replays are detected during signature verification.

INSECURE: Requiring timestamp, sender and recipient of the requests
   allows identical replayed requests to be detected. However,
   if the attacker can modify the request (for example by changing the timestamp),
   it can no longer be distinguished from a newly generated request, 
   which may result in the unauthorized disclosure of information.

## Response replay

The sender processes only one response for each request. Any subsequent replayed responses are ignored.

## Response injection

SAFE: Third parties cannot inject forged responses into the communication channel.

KNOWN: The sender MAY require responses to be digitally signed. 
   Successful signature verification prevents processing forged injected responses
   from being accepted.

INSECURE: Third parties may be able to inject forged responses.

## Key compromise

If a private key stored by an identity server is compromised, a third party can use it
to forge requests on behalf of the key's owner.

Systems that store public keys of identities are RECOMMENDED to maintain
a last-verification timestamp for each key. Public keys SHOULD be periodically
retrieved again from their owner's identity servers to detect revocation
or replacement following a key compromise.

SAFE: Even with a compromised key, third parties cannot give forged answers, because
   the requests are delivered to the legitimate identity server.

KNOWN, INSECURE: A compromised private key allows a third party to 
   impersonate the corresponding identity either as the senders or the receiver.

## Man in the middle attack

If a third party gets control over the communication channel, for example
by changing the DNS resolution, it can cause security risks.

The transfer protocol can help the situation, for example, an HTTPS or TLS connection
does not allow that kind of interception, because the third party does not own
a certificate for the destination domain.

SAFE: A safe environment only allows authenticated endpoints.

KNOWN: If all the communication is digitally signed with public keys, third parties cannot
   alter messages or inject forged ones. However, they can intercept information unless
   all messages are encrypted.

INSECURE: The third party controlling the communication channel can 
   fully impersonate either communicating party.

## Confidentiality

SAFE: The communication channel ensures that no third party can read the transmitted data.

KNOWN: If the transmitted data is sensitive, it is RECOMMENDED to encrypt it.

INSECURE: As the public keys cannot be exchanged securely, there is no way to ensure confidentiality.

## Flooding attacks

Identity servers may become targets of various flooding attacks,
especially if they host a large number of identities. However, the structure of IID messages
allows several mitigation techniques.

An identity server MAY reject excessively large messages with `#eiid.size` without processing them.

Requests that do not identify the sender MAY also be rejected.

Requests from the same sender within a short time MAY be rejected or deferred by responding with #eiid.later.

Encrypted messages require more processing time. However they MAY also be queued per recipient or
deferred by responding with `#eiid.later`.

# Trust chain discovery

If both communication parties have prior knowledge of one or more attester 
and trusted identities, and their trust networks overlap, an otherwise
INSECURE environment can be bootstrapped into a KNOWN one.

Assume two parties, `X` and `Y`. 

`X` maintains a set of its own trusted identities (for example, `T1`, `T2`, `T3`, ...). 
It can recursively expand this set by including the trusted identities of
each member of the list (for example `T11`, and `T12` are trusted by `T1`),

At the same time, `X` can recursively discover the attesters of `Y` 
(for example `A1`, `A2`, `A3`, ...), and the attesters of those identities 
(`A11`, `A12`, `A13`, ...).

If the two networks overlap, there exists an identity `S` that
is present in both the trusted and the attester network. A trust chain
can then be constructed from `X` to `Y` by ascending through trusted
identities to `S` and descending through attesters to `Y`.

For example:
   `X` -> `T2` -> `T23` -> `S` -> `A332` -> `A33` -> `A3` -> `Y`

Since `X` already trusts `T2`, it possesses a verified copy of `T2`'s public key. 
Using that key, `X` can securely obtain `T23`'s public key from `T2`.

Repeating this process allows `X` to obtain a correct copy of `S`'s public key. 

Because `S` is an attester of `A332`, `X` can securely obtain `A332`'s public key from `S`.
The same process can be repeated down the attester chain until `X` obtains
an authenticated copy of `Y`'s public key.

`Y` can perform the same procedure independently in the opposite direction.
After the discovery process completes, both parties possess verified
copies of each other's public keys and therefore operate in a KNOWN environment.

Unlike the traditional TLS model, this mechanism does not require 
globally trusted root certificate authorities. As long as
the trust networks of the two parties overlap, they can discover a
trust chain that enables secure communication.

As with most trust-chain-based systems, the security of this discovery 
process depends on the weakest link in the chain: if any intermediate 
identity's key is compromised, it can undermine the trust established 
through it. This risk can be reduced by periodically re-verifying the 
trusted keys.

--- back

