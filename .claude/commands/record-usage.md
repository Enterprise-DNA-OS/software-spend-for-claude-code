# record-usage

Record dated usage observations from a checked source.

Run from the repository root:

```bash
npm run spend -- record-usage "Sales seat 01" --last-used-on=YYYY-MM-DD --observed-on=YYYY-MM-DD --review-due=YYYY-MM-DD --evidence="Controlled usage export reference" --actor="Your name"
```

Use --json when comparing records. Read full evidence and history before drawing conclusions. Present missing values as unknown. Never combine currencies. Never send, buy, cancel, revoke or contact a vendor.

Read the record first using show. Use the operator's actual actor label and the confirmed source evidence. List ambiguous matches before changing a record. A removed assignment records a completed external action only. A decision is an internal recommendation; it requires a different approver and the current contract version.
