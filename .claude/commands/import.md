# import

Rehearse and load the Torii contract export.

Run from the repository root:

```bash
npm run spend -- import torii --file=imports/contracts.csv --actor="Your name" --dry-run
```

Use --json when comparing records. Read full evidence and history before drawing conclusions. Present missing values as unknown. Never combine currencies. Never send, buy, cancel, revoke or contact a vendor.

Read docs/replace-torii.md first. Inspect headers, choose date format and map custom statuses explicitly. Run the dry run, review counts and warnings, then remove --dry-run to apply the agreed import. Preserve the original export. Changed source rows need explicit --update-existing after review.
