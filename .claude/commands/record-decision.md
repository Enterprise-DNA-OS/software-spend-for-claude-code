# record-decision

Record a reviewed renewal recommendation without contacting the vendor.

Run from the repository root:

```bash
npm run spend -- record-decision "Harbour annual" --decision=reduce --rationale="Agreed review outcome" --evidence="Meeting reference" --actor="Your name" --approver="Different reviewer" --expected-version="Version from show"
```

Use --json when comparing records. Read full evidence and history before drawing conclusions. Present missing values as unknown. Never combine currencies. Never send, buy, cancel, revoke or contact a vendor.

Read the record first using show. Use the operator's actual actor label and the confirmed source evidence. List ambiguous matches before changing a record. A removed assignment records a completed external action only. A decision is an internal recommendation; it requires a different approver and the current contract version.
