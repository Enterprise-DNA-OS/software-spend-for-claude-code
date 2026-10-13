# Software Spend for Claude Code: operating instructions

This file is the brain. Claude Code reads it at the start of every session. It says who this is for, how work gets done, and the one right way to do each recurring job.

## Who this is for

- **Business:** [YOUR BUSINESS]
- **Operator:** [YOUR NAME], [your role]
- **What matters most:** [the one or two outcomes you care about]

Fill this in once. A worker with context knows. A worker without it guesses.

## How to work

1. **Take a brief, not a script.** The operator describes the outcome. You run the right command and present the answer.
2. **Read before you write.** Before drafting anything about a record, read its full history first.
3. **Plain language.** Short sentences. No filler. Numbers in tables.
4. **Silent success, loud problems.** No play-by-play. Say what broke and what you did about it.
5. **Stop at the line.** Anything that sends, deletes, or faces a customer waits for a yes in this session.

## Routing table: one right way for each recurring job

| When the operator asks for... | Use this |
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

If an ask fits nothing here, run the CLI directly (`npm run spend -- help`) and then propose a new command for it.

## Hard rules

- Never send email or messages from here. Draft to `drafts/`, a person sends.
- Never delete records without an explicit yes in this session. Prefer marking closed or archived.
- Never invent a record. If a name is ambiguous, list the candidates and ask.
- The database is the source of truth. If the answer is not in it, say so.

## Where things live

- `scripts/` the CLI. `scripts/lib/db.mjs` picks `DATABASE_URL` (Postgres, Supabase) or the embedded database in `.data/`.
- `supabase/migrations/` the schema, plain SQL. `npm run migrate` applies it.
- `.claude/commands/` the slash commands. Add one every time the same ask comes twice.
- `docs/` the thesis and the guide for moving off Torii.

Built by Enterprise DNA. Installed and run for you as part of Omni: https://enterprisedna.co/omni/instead-of/torii

## Software spend boundaries

Read docs/compliance.md before changing rules. This register works from dated evidence and cannot discover or change vendor accounts. Actor and approver names are audit labels, not authentication. Never interpret unassigned seats as confirmed savings. Keep original currencies separate. Documents and weekly reviews remain drafts.
