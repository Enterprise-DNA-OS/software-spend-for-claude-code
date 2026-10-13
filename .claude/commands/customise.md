# customise

Read CLAUDE.md, the current migration, CLI and tests. Agree the field or policy change with the operator. Back up the database with export. Write the next numbered SQL migration, retain existing records, update the CLI field allowlist and relevant query, and add a smoke assertion for the changed business rule. Run npm test in isolation, then npm run migrate on the agreed database. Update the command recipes and compliance sources if a rule changes. No destructive migration, vendor action or send without explicit instruction. Never edit an already applied migration.
