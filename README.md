# Daftari

Paperless chama meetings. Daftari replaces the paper register and passbooks a chama (savings group) uses at its monthly meeting. Officials record each member's cash, deductions, savings and loans on a tablet. The app works fully offline and syncs when a connection returns.

> Status: design phase. The screens and rules below come from the [Daftari design canvas](https://claude.ai/artifact/UbkgxhEY5a5scknLDqVyVd). No application code exists yet.

## Who it is for

- **Chairlady / meeting lead**: runs the session and records member entries.
- **Treasurer**: counts the cash box, reconciles the session and posts corrections.
- **Members**: each has a ledger with savings, Gumbato and long-term loan balances.

The primary device is a 10–11" tablet (designed at 1194 × 834). Phones are supported with a stacked layout (390 × 844).

## Meeting flow

1. **Unlock**: 4-digit PIN per official. Unlock works offline. The screen shows when the tablet last synced and how many entries are waiting.
2. **Home**: one primary action, *Start session*. Past sessions open read-only, each with its sync state and cash variance.
3. **Start session**: date defaults to today and the name is pre-filled. Everyone starts Present; tap a member to cycle Present → Late → Absent. Late and Absent pre-apply their penalty in that member's entry.
4. **Workspace**: a member list beside the entry panel. The keypad opens focused on *Cash received*. Type the amount, defaults apply, savings auto-fills the remainder, then *Save & Next*. Target: about 10 seconds per member.
5. **Loans**: issue or repay a Gumbato (short-term) or long-term loan from inside a member's entry.
6. **End session**: totals by category, expected cash in the box, the treasurer's physical count and the variance. A variance needs a reason before the session locks.
7. **Reconciliation**: corrections after closing are new, linked adjustment entries.

## Core rules

### Entry allocation

```
deductions  = sum of deduction chips that are ON
fees        = Gumbato form fee + long-term form fee (only when a loan is issued in this entry)
allocated   = savings + repay_short_term + repay_long_term
unallocated = cash − deductions − fees − allocated
```

- Savings is **AUTO** by default (`cash − deductions − fees − repayments`), so unallocated is 0. Typing into savings turns AUTO off.
- `unallocated > 0`: amber warning; the primary button becomes *Put KES X in savings & Save*.
- `unallocated < 0`: red *Over-allocated*; Save is disabled.
- Loan disbursements are cash **out** of the box. They never enter this equation; they reduce expected cash at session close.

### Gumbato (short-term loan)

| Rule | Default |
| --- | --- |
| Charge | 10% of principal, added once at issue |
| Total debt | principal + charge |
| Form fee | KES 20 flat, paid from the entry's cash |
| Deadline | issue date + 3 months |
| Suggested installment | `ceil(debt ÷ 3)`, last one takes the remainder |
| Overdue | today > deadline, or 3 repayments made with debt > 0 |
| Limit | one active Gumbato per member; a second is blocked |

Example: 10,000 → charge 1,000 → debt 11,000 → installments 3,667 / 3,667 / 3,666.

### Long-term loan

| Rule | Default |
| --- | --- |
| Interest | 14% simple, on the principal for the whole term |
| Form fee | KES 100 per 10,000 of principal, rounded up to the nearest 10 |
| Period | 12 months, changeable per loan |
| Monthly installment | total repayable ÷ period |
| Issue | requires the paper form reference |

Example: 50,000 → interest 7,000 → repayable 57,000 → 4,750/month, form fee 500.

### Deductions

Configured in Settings and shown as chips in every entry.

| Deduction | Amount (KES) | Applies |
| --- | --- | --- |
| Cash insurance | 50 | Everyone by default |
| Sitting allowance | 100 | Everyone by default |
| Lateness penalty | 100 | Opt-in; auto-on when marked Late |
| Absence penalty | 200 | Opt-in; auto-on when marked Absent |
| Welfare (bereavement) | 300 | Opt-in; inactive by default |

- *Everyone by default* chips start ON; *Opt-in* chips start OFF.
- A new amount applies from now on; past entries keep the amount they were recorded with.
- Archiving hides a deduction but keeps its history.
- Loan rate changes apply to **new loans only**; active loans keep their original terms.

### Session close

```
cash received = savings + Gumbato repaid + long-term repaid + deductions + fees
expected cash = cash received − loans paid out
variance      = counted − expected
```

Closing locks the session read-only.

### Ledger integrity

- Entries are never edited or deleted. *Reverse* or *Adjust* writes a new entry linked to the original, with a reason, author and timestamp (for example `ADJ-0014` correcting `E-0368`).
- The member ledger shows full history with balances recalculated after every row. Adjustments sit inline next to the entry they correct.
- Opening balances are migrated from paper passbooks as an `OB-` entry.

## Offline and sync

Every save goes to the tablet first. Each member row shows one status:

| Status | Meaning |
| --- | --- |
| Synced | Uploaded to the server |
| Saved on device | Stored locally, waiting to upload |
| Draft | Not saved yet; kept on the tablet, never uploaded |
| Sync failed | Upload failed; tap to retry (or *Retry all* in the offline banner) |
| Not yet processed | No entry this session |

- Switching members never loses work: the row keeps a Draft badge and tapping it restores the entry.
- Closing the app or a flat battery does not lose saved entries.

## Design reference

The full set of screens (PIN unlock, home, session setup, workspace states, loan modals, sync states, drafts, session close, reconciliation, member ledger, settings and phone layouts) lives on the [design canvas](https://claude.ai/artifact/UbkgxhEY5a5scknLDqVyVd).

Visual basics: IBM Plex Sans with tabular numerals, navy `#0E1726` chrome, primary blue `#1F3FD1`, touch targets of at least 48 px and 72 px PIN/keypad keys. Amounts are in Kenyan shillings (KES).
