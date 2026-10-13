<h1 align="center">Software Spend for Claude Code</h1>

<p align="center">
  <strong>The open-source software spend register that is just a database and Claude Code.</strong>
</p>

<p align="center">
  Created by <a href="https://www.enterprisedna.co"><strong>Enterprise DNA</strong></a>. Free and open source. Works with Claude Code, Codex, OpenCode or Cursor.
</p>

<!-- three-doors -->
<table align="center">
  <tr>
    <td align="center"><strong>Do it yourself</strong><br/>Clone it, run it, own it. Free, MIT.<br/><a href="#quick-start">Quick start</a></td>
    <td align="center"><strong>We customise it</strong><br/>Your fields, your rules, your Torii data brought across.<br/><a href="https://enterprisedna.co/omni/book/?utm_source=github&utm_medium=readme&utm_campaign=torii">Book a call</a></td>
    <td align="center"><strong>We run it for you</strong><br/>Installed, connected and operated inside Omni. Setup fee, then a retainer.<br/><a href="https://enterprisedna.co/omni/instead-of/torii?utm_source=github&utm_medium=readme&utm_campaign=torii">How it works</a></td>
  </tr>
</table>

<p align="center">
  <a href="#what-is-this">What is this</a> &bull;
  <a href="#why-no-front-end">Why no front end</a> &bull;
  <a href="#quick-start">Quick start</a> &bull;
  <a href="#the-commands">Commands</a> &bull;
  <a href="#instead-of-torii">Instead of Torii</a> &bull;
  <a href="#want-it-installed-and-run-for-you">Installed for you</a> &bull;
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node-20+-339933?style=flat-square" alt="Node 20+" />
  <img src="https://img.shields.io/badge/PostgreSQL-any-336791?style=flat-square" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/PGlite-embedded-3ecf8e?style=flat-square" alt="PGlite" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="MIT License" />
</p>

---

## What is this

Software Spend for Claude Code handles software subscription and renewal records, as a Postgres database and a set of agent commands. There is no web front end. You open the folder in [Claude Code](https://claude.com/claude-code) (or Codex, OpenCode, Cursor: see `AGENTS.md`) and ask for what you want in plain language. It runs the right query, and you can add questions across your own records. Torii also supports reports and workflows.

Torii does not publish a numeric price on its own pricing page. Its vendor-run AWS Marketplace Enterprise listing shows US$30,000 for a 12-month contract, checked 13 October 2026. This is a listed contract benchmark, not a verified NZ/AU invoice or a quote for a small team. [Vendor pricing](https://www.toriihq.com/pricing), [Marketplace listing](https://aws.amazon.com/marketplace/pp/prodview-kuputijtv2xis).

Want the same thing with a web front end, or built on a different stack? That is a customisation, and it is exactly what Enterprise DNA does: [book a call](https://enterprisedna.co/omni/book/?utm_source=github&utm_medium=readme&utm_campaign=torii).

Built for a trusted finance or operations coordinator. Keep applications, contract notice periods, licences, spend, review evidence and renewal decisions together. This register does not discover accounts or change vendor access. Omni by Enterprise DNA adds the connections and team screens you agree, for one setup fee then a retainer.

## Why no front end

- The front end was only ever there because the database was hard to talk to. That is no longer true.
- Your data sits in plain Postgres tables you own. Any tool can read them. No export, no lock-in.
- No seats, no tiers, no add-ons. Read [docs/why-no-front-end.md](docs/why-no-front-end.md) for the honest trade-offs too.

## Quick start

No database install (an embedded Postgres runs inside Node):

```bash
git clone https://github.com/Enterprise-DNA-OS/software-spend-for-claude-code.git
cd software-spend-for-claude-code
npm install
npm run demo
```

Then open the folder in Claude Code and type a slash command. Start with `/notice-deadlines`. For real work, choose an empty DATA_DIR and migrate without the demo seed.

### Use it with your own Postgres or Supabase

Copy `.env.example` to `.env`, set `DATABASE_URL`, then `npm run migrate`. Same commands, shared data, no per-seat fee.

## The commands

| Command | Job |
|---|---|
| `/applications` | Read the software register and accountable owners |
| `/contracts` | Read original contract values and source records |
| `/assignments` | Read recorded licence assignments |
| `/expenses` | Read invoice records in their original currency |
| `/renewals` | Review contract ends and notice dates |
| `/notice-deadlines` | Prepare the next renewal decisions before notice is due |
| `/licence-review` | Compare purchased and recorded seats with evidence freshness |
| `/inactive-seats` | Review inactivity candidates supported by recent observations |
| `/stale-usage` | Find usage observations that need refreshing |
| `/category-overlap` | Find overlapping tools to discuss with their owners |
| `/spend-review` | Review recorded spend by application and currency |
| `/commitments` | Read whole-term commitments without mixing currencies |
| `/owner-workload` | See which owner has the most upcoming decisions |
| `/decisions` | Read renewal recommendations and check contract versions |
| `/attention` | Find missing, overdue and inconsistent records |
| `/compliance` | Check privacy and local record evidence |
| `/history` | Read attributed changes |
| `/show` | Read one record and its change history |
| `/add` | Add an application, contract, assignment or invoice |
| `/update` | Update a record with attributed evidence |
| `/log` | Record an owner conversation on an application |
| `/record-usage` | Record dated usage observations from a checked source |
| `/record-decision` | Record a reviewed renewal recommendation without contacting the vendor |
| `/import` | Rehearse and load the Torii contract export |
| `/export` | Export all records, notes, decisions and history |
| `/weekly-review` | Draft the Monday renewal, licence and evidence review |
| `/draft-renewal-brief` | Draft contract deadlines, commitments and overlap questions |
| `/draft-access-review` | Draft inactive seats, stale observations and review evidence |
| `/help` | Read supported commands and editable fields |
| `/customise` | Change a field or rule with a tested migration |
| `/new-view` | Add a branded read-only report |



## Instead of torii

Export your Torii contract list, rehearse the import, then compare counts and original-currency totals. [Switching guide](docs/replace-torii.md).

## Architecture

```
software-spend-for-claude-code/
  CLAUDE.md                 how the operator wants this run (routing table + house rules)
  AGENTS.md                 the same, for Codex / OpenCode / Cursor / Gemini CLI
  .claude/commands/         the slash commands
  scripts/                  the CLI the commands drive
  scripts/lib/db.mjs        one adapter: DATABASE_URL (pg) or embedded PGlite
  supabase/migrations/      plain SQL schema
  supabase/seed.sql         demo data
  docs/                     the thesis and the migration guide
```

## Built for coding agents

The database, CLI and command recipes work with Claude Code, Codex, OpenCode or Cursor. Ask your coding agent for a new command and have it implement and test the change against the same records.

## Contributing

Issues and pull requests are welcome. Keep the shape: plain SQL, a small CLI, a slash command per recurring job, no front end.

## Want it installed and run for you?

Enterprise DNA installs Software Spend for Claude Code for your business, migrates your Torii data, connects it to the rest of your tools, and runs it for you as part of **Omni**, our managed Command Centre. One setup fee, then a monthly retainer.

- Book a call: [enterprisedna.co/omni/book](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=torii)
- Read more: [enterprisedna.co/omni/instead-of/torii](https://enterprisedna.co/omni/instead-of/torii?utm_source=github&utm_medium=readme&utm_campaign=torii)

## License

MIT. Copyright (c) 2026 Enterprise DNA.

## Evidence and ownership

Every write requires --actor. Names match case insensitively, UUID prefixes work, and ambiguous matches list candidates and exit 1. Changes are attributed and versioned. A renewal decision needs a different approver label, evidence, and --expected-version copied from show. It is an internal record only, never a purchase, cancellation or notice to a vendor. Updating a contract makes earlier decisions stale.

Spend totals are grouped by currency. Contract value is the whole recorded term, not annual recurring spend. Unknown seats and dates stay unknown. Stale usage does not count as inactivity. [Checks and sources](docs/compliance.md) explain the local thresholds and legal record principles.

npm run view renders two branded read-only reports. npm run docs renders renewal briefs and application access reviews. Edit brand.json once for your name, logo and colours. The output is local HTML for review or printing. Drafts never send.

## Ten questions to ask of your records

These queries work today. Torii has configurable reporting; we make no unsupported claim that it cannot answer an equivalent question.

1. Which notice deadlines have already passed? `notice-deadlines`
2. Which renewals have no notice period recorded? `attention`
3. Which software has no accountable owner? `applications`
4. Which inactive seats have recent supporting evidence? `inactive-seats`
5. Which licence observations are too old to trust? `stale-usage`
6. Where do purchased and recorded seat counts disagree? `licence-review`
7. Which tools overlap in the same category? `category-overlap`
8. What have we spent in each original currency? `spend-review`
9. Which owner has the largest upcoming renewal workload? `owner-workload`
10. Which renewal recommendations refer to an older contract version? `decisions`

## Your first hour: ten things to ask for

1. Put our name and logo in brand.json.
2. Rehearse our Torii contract export without changing records.
3. Show every missing notice period.
4. Group our recorded commitments by currency.
5. Find our unowned software.
6. Review stale licence observations before claiming unused seats.
7. Compare tools in the same category.
8. Draft the coming renewal decisions.
9. Record who approved a renewal recommendation.
10. Add our budget owner field with /customise and a tested migration.

## Verification

npm test uses a temporary PGlite database, or an explicitly empty TEST_DATABASE_URL for Postgres. It exercises every CLI command, import rollback, repeat imports, stale decisions, currency separation, missing evidence and report generation. The workflow runs on Windows and Linux, with a separate Postgres job. Never set TEST_DATABASE_URL to a database containing real records.
