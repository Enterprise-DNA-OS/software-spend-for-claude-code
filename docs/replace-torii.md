# Move software contract records from Torii

The free version imports Torii contract CSV records. It does not claim to import connected application discovery, usage telemetry, historical approval workflows, attachments, identities or provisioning automation.

1. In Torii, open Renewals, then Contracts. Clear filters and choose the fields you need. Export the entire contract list. Torii documents the export [here](https://support.toriihq.com/hc/en-us/articles/40877680155803-Renewals). CSV contains the selected columns and filters, so check them before export ([report guidance](https://support.toriihq.com/hc/en-us/articles/28179790220699-Share-Schedule-Reports-from-Torii)).
2. Include Contract name, Application name and Status. These are Torii's documented required contract fields ([field requirements](https://support.toriihq.com/hc/en-us/articles/5150804779291-Importing-Contracts-into-Torii)). Include start date, end date, Contract value and Contract currency. Optional custom columns for seats and notice days are mapped explicitly. The sample is a synthetic fixture using documented field names, not a captured customer export.
3. Keep original contract values and currencies. Torii exports converted values separately; this importer does not use them ([currency guidance](https://support.toriihq.com/hc/en-us/articles/13240433662107-Managing-Contracts-In-Multiple-Currencies)). Amounts must be ungrouped decimals with at most two decimal places. No currency guessing. If a value exists without its original currency, import fails.
4. Start an empty database without the demo: set DATA_DIR to a private empty directory in .env and run npm run migrate. Save contracts.csv under imports/, which Git ignores.

```bash
npm run spend -- import torii --file=imports/contracts.csv --actor="Your name" --dry-run
npm run spend -- import torii --file=imports/contracts.csv --actor="Your name"
npm run spend -- contracts
npm run spend -- attention
npm run spend -- export --file=exports/first-check.json
```

Create the exports directory before writing. A dry run validates every row inside a transaction and rolls back. A bad row rolls back the whole file, including newly created applications. Import accepts Torii's optional sep=, first line, BOM, quoted commas and newlines. Dates default to YYYY-MM-DD. Use --date-format=DD/MM/YYYY or --date-format=MM/DD/YYYY explicitly; dates are never guessed.

| Source column | Destination |
|---|---|
| Contract name + Application name | Stable import identity, case insensitive |
| Status | draft, active, ended or cancelled; custom statuses need --status-map |
| Start date, End date | Contract period |
| Notice period (days), Purchased seats | Optional custom numeric fields; missing values remain unknown |
| Contract value, Contract currency | Original total commitment, never mixed across currencies |
| Owner or Contract owner | Owner when creating an application |
| Contract URL or Evidence | Evidence reference |
| Every other column | Preserved in source_data, named in the import warnings |

Use --map=examples/column-map.json to map your custom field names. Only the declared fields can be mapped. Use --status-map=examples/status-map.json for custom status values. Repeating an unchanged import skips it. A changed source row fails until reviewed and explicitly imported with --update-existing. That updates its contract version and makes older decision records stale. It does not overwrite application ownership on subsequent imports. Renaming either source identity creates a different key: reconcile names before importing; do not use renames to update a contract.

Compare record counts, original-currency totals, owners and several notice dates against Torii and the signed documents. Missing dates, amounts or notices stay visible as attention items. Set up assignments and expenses using add after reviewing their separate source files. Keep the original exports and attachments in a controlled archive. Run both systems through a renewal review before deciding whether to stop Torii. Any connected discovery or account changes needed by your team belong in the agreed custom installation.

Sources checked 13 October 2026.
