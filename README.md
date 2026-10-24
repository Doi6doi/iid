# IID: A Swiss Army knife for internet identity

Imagine an address like `john@doe.org` that is more than a mailbox:
it holds your personal data, preferences, permissions and public keys,
and you decide who gets to see it. With it you can sign in to websites,
give or revoke consent, and digitally sign documents. That is IID.

## What can you do with it?

| Use case | In one line |
|---|---|
| **Sign in** | A website asks your identity server who you are. You approve once, the site only needs to store your IID. |
| **Share data, with an expiry** | A webshop can query your name and address directly from your server. It gets only the approved data. No more filling forms. |
| **Consent you can prove** | Newsletters, cookies, marketing. The answer comes back signed. Revoking is one message. |
| **Instant messages** | You can send an instant message, file, or any type of data to any identity, person or company. Unknown senders can be blocked or queried. You can filter out unwanted messages. |
| **Agents and crawlers** | AI agents and crawlers can be required to identify themselves or their masters. Your site has control over who scans it. |
| **Verified claims** | "Is this really John's request or signature?" A third party can attest to it. |

## Why IID

- **Simple.** Plain JSON, human readable, easy to implement in any language.
- **Decentralized.** Like e-mail: the domain part of the IID finds the server. No central provider, you can even host your own server.
- **Transport-agnostic.** HTTPS today, anything else tomorrow. Any cryptographic algorithm can be used.
- **No global root CA needed.** Trust chains are discovered through the identities each side already trusts.
- **One protocol** instead of separate solutions for login, data sharing, consent and signing.

## Specification

This repository holds the Internet-Draft `draft-varnagy-iid-protocol-00`, 
an early working draft. Feedback is welcome, please open an issue.

- [Read the draft (HTML)](https://htmlpreview.github.io/?https%3A%2F%2Fraw.githubusercontent.com%2FDoi6doi%2Fiid%2Frefs%2Fheads%2Fmain%2Fiid.en.html)

## Example

A webshop asks for a shipping address:

```json
{
  "from": "site@webshop.com",
  "to": "john@doe.org",
  "action": "#miid.data",
  "params": ["#diid.fullname", "#diid.postaddress"]
}
```

John's identity server answers with the data and a retention limit:

```json
{
  "value": {
    "#diid.fullname": "John Doe",
    "#diid.postaddress": { 
       "#diid.country":"US", 
       "#diid.zip":"10004",
       "#diid.street":"Liberty", 
       "#diid.house":1 
    },
    "#diid.until": 1783559940
  }
}
```





