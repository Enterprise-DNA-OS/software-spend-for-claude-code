# Software records and evidence checks

Checked 13 October 2026. These checks find missing records. They do not certify legal compliance, inspect a vendor or revoke an account.

| Rule | Record check | Authority and scope |
|---|---|---|
| NZ-IPP5 | A personal-data application has current security review dates and evidence | [NZ Privacy Commissioner, principle 5](https://www.privacy.org.nz/privacy-principles/5/): reasonable safeguards for personal information. The law does not prescribe this review interval. |
| NZ-IPP9 | A personal-data application has a current retention review date | [NZ Privacy Commissioner, principle 9](https://www.privacy.org.nz/privacy-principles/9/): retain personal information only while needed for a lawful purpose. No universal retention period is encoded. |
| LOCAL-ACCESS | Active assignment has evidence and a current review date | Local operating policy, not a statutory time limit. Staff set the date from their approved access policy. |
| LOCAL-CONTRACT | Active contract has a source evidence reference | Local record policy, not a legal test of contract validity. |

The licence review treats observations older than 30 days as stale. An inactivity candidate needs an observation within 30 days and a last-used date older than 60 days. These are explicit local review thresholds, not grounds for automatic removal. Unknown use remains unknown. Change them through /customise after agreeing the policy.

Notice deadlines subtract calendar days from the recorded end date. Check the signed contract for business-day clauses, notice recipients and exceptions. A past deadline remains visible; the program never rolls a contract forward silently. Purchased seats aggregate current active contracts; check for overlapping renewals before treating the result as entitlement evidence.

Decision records need separate actor and approver labels and the exact contract version. These labels are an audit trail, not authenticated identities. Database owners can bypass the CLI. Deployment needs a trusted operator account, encrypted storage and backups, and access restricted to the people responsible for the register. Public database roles have no access by default. Do not put employee exports or contract documents in Git.

Prefer role or seat labels over employee identifiers. Record links to evidence held in your existing controlled archive. No authentication credentials, payment details or sensitive employee files belong here. Apply your own retention policy to register exports, drafts and audit records. No deletion or sending command is supplied.
