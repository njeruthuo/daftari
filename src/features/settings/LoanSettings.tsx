import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Banner, Button, Card, Field, MathRows, SectionLabel } from '@/components/ui'
import { selectCurrentOfficial } from '@/features/auth/authSlice'
import { formatDate } from '@/lib/dates'
import { gumbatoTerms, loanStatus, longTermTerms } from '@/lib/loans'
import { fmt, toNumber } from '@/lib/money'
import SettingsLayout from './SettingsLayout'
import { saveLoanSettings } from './settingsSlice'

type Values = Record<'chargePct' | 'stMonths' | 'stFee' | 'interestPct' | 'feePer10k' | 'ltMonths', string>

export default function LoanSettings() {
  const dispatch = useAppDispatch()
  const official = useAppSelector(selectCurrentOfficial)
  const settings = useAppSelector((state) => state.settings)
  const { entries, loans } = useAppSelector((state) => state.ledger)

  const saved: Values = {
    chargePct: String(settings.gumbato.chargePct),
    stMonths: String(settings.gumbato.months),
    stFee: String(settings.gumbato.formFee),
    interestPct: String(settings.longTerm.interestPct),
    feePer10k: String(settings.longTerm.feePer10k),
    ltMonths: String(settings.longTerm.months),
  }
  const [values, setValues] = useState<Values>(saved)

  const gumbato = { chargePct: toNumber(values.chargePct), months: Math.max(1, toNumber(values.stMonths)), formFee: toNumber(values.stFee) }
  const longTerm = { interestPct: toNumber(values.interestPct), feePer10k: toNumber(values.feePer10k), months: Math.max(1, toNumber(values.ltMonths)) }
  const st = gumbatoTerms(5000, gumbato)
  const lt = longTermTerms(100000, longTerm)
  const changes = (Object.keys(values) as (keyof Values)[]).filter((k) => values[k] !== saved[k]).length
  const active = (type: 'gumbato' | 'longterm') => loans.filter((l) => l.type === type && loanStatus(l, entries).active).length

  function field(key: keyof Values, label: string, hint: string, suffix: string) {
    return (
      <Field
        label={label}
        hint={hint}
        suffix={suffix}
        inputMode="numeric"
        value={values[key]}
        onChange={(e) => setValues({ ...values, [key]: e.target.value.replace(/\D/g, '') })}
        className={values[key] !== saved[key] ? '[&_input]:border-2 [&_input]:border-[#d98a00]' : ''}
      />
    )
  }

  return (
    <SettingsLayout title="Loan settings">
      <Banner tone="info">
        Applies to new loans only. {active('gumbato')} active Gumbato and {active('longterm')} active long-term loans keep the terms they were issued with.
      </Banner>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="flex flex-col gap-4 p-5">
          <div>
            <h2 className="text-lg font-bold">Gumbato · short-term loan</h2>
            <p className="text-sm text-ink-2">Flat charge added once at issue</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {field('chargePct', 'Charge', 'Added at issue', '%')}
            {field('stMonths', 'Max repayments', 'Clear within', 'months')}
            {field('stFee', 'Form fee', 'Flat, any amount', 'KES')}
          </div>
          <div className="rounded-[10px] bg-subtle px-4 py-1">
            <SectionLabel className="block pt-2 !text-xs">Live example</SectionLabel>
            <MathRows
              rows={[
                { label: 'Borrow', value: fmt(st.principal) },
                { label: `Charge ${gumbato.chargePct}%`, value: `+ ${fmt(st.charge)}` },
                { label: `Total debt · clear in ${gumbato.months}`, value: fmt(st.total), total: true },
                { label: 'Form fee', value: fmt(st.formFee) },
              ]}
            />
          </div>
        </Card>
        <Card className="flex flex-col gap-4 p-5">
          <div>
            <h2 className="text-lg font-bold">Long-term loan</h2>
            <p className="text-sm text-ink-2">Simple interest on the principal</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {field('interestPct', 'Interest', `Whole term · was ${saved.interestPct}%`, '%')}
            {field('feePer10k', 'Form fee per 10,000', 'Rounded up to 10', 'KES')}
            {field('ltMonths', 'Default period', 'Per loan', 'months')}
          </div>
          <div className="rounded-[10px] bg-subtle px-4 py-1">
            <SectionLabel className="block pt-2 !text-xs">Live example</SectionLabel>
            <MathRows
              rows={[
                { label: 'Borrow', value: fmt(lt.principal) },
                { label: `Interest ${longTerm.interestPct}%`, value: `+ ${fmt(lt.charge)}` },
                { label: `Total repayable · ${longTerm.months} months`, value: `${fmt(lt.total)} · ${fmt(lt.installment)}/mo`, total: true },
                { label: 'Form fee', value: fmt(lt.formFee) },
              ]}
            />
          </div>
        </Card>
      </div>
      <Card className="flex flex-wrap items-center gap-3 px-5 py-3">
        <span className="flex-1 text-sm text-ink-2">
          {changes ? `${changes} unsaved change${changes > 1 ? 's' : ''}. ` : 'No unsaved changes. '}
          {settings.updatedAt ? `Last saved ${formatDate(settings.updatedAt)} by ${settings.updatedBy}.` : ''}
        </span>
        <Button disabled={!changes} onClick={() => setValues(saved)}>
          Discard
        </Button>
        <Button variant="primary" disabled={!changes} onClick={() => dispatch(saveLoanSettings({ gumbato, longTerm, by: official?.name ?? '' }))}>
          Save for new loans
        </Button>
      </Card>
    </SettingsLayout>
  )
}
