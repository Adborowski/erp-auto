import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useServiceOrders } from '@/context/ServiceOrdersContext'
import { getCustomers } from '@/data/customers'
import type { ServiceOrder, ServiceOrderPriority } from '@/data/types'
import { PRIORITY_CONFIG } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  ArrowLeft, ArrowRight, Check, User, Car, FileText, ClipboardCheck,
  Phone, Mail, Building2,
} from 'lucide-react'

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Customer',  icon: User },
  { label: 'Vehicle',   icon: Car },
  { label: 'Complaint', icon: FileText },
  { label: 'Review',    icon: ClipboardCheck },
]

// ─── Form shape ───────────────────────────────────────────────────────────────

const INITIAL_FORM = {
  customerName:        '',
  customerEmail:       '',
  customerPhone:       '',
  customerCompany:     '',
  vehicleMake:         '',
  vehicleModel:        '',
  vehicleYear:         String(new Date().getFullYear()),
  vehicleLicensePlate: '',
  vehicleColor:        '',
  vehicleMileage:      '',
  vehicleVin:          '',
  complaint:           '',
  priority:            'normal' as ServiceOrderPriority,
}
type FormData = typeof INITIAL_FORM

function isStepValid(step: number, f: FormData): boolean {
  switch (step) {
    case 0: return !!(f.customerName.trim() && f.customerEmail.trim() && f.customerPhone.trim())
    case 1: return !!(f.vehicleMake.trim() && f.vehicleModel.trim() && f.vehicleYear.trim() && f.vehicleLicensePlate.trim() && f.vehicleColor.trim() && f.vehicleMileage.trim())
    case 2: return !!f.complaint.trim()
    default: return true
  }
}

// ─── Small shared UI helpers ──────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-400'

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-start justify-center gap-0">
      {STEPS.map((step, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div key={step.label} className="flex items-start">
            <div className="flex flex-col items-center w-24">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                done   ? 'border-green-500 bg-green-500 text-white'
                       : active ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-white text-slate-400',
              )}>
                {done
                  ? <Check className="h-4 w-4" />
                  : <step.icon className="h-3.5 w-3.5" />}
              </div>
              <span className={cn(
                'mt-1.5 text-center text-[11px] font-medium',
                active ? 'text-slate-900' : done ? 'text-green-600' : 'text-slate-400',
              )}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'mt-4 h-0.5 w-10 flex-shrink-0 transition-colors',
                i < current ? 'bg-green-400' : 'bg-slate-200',
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1: Customer ─────────────────────────────────────────────────────────

function StepCustomer({ form, onChange }: { form: FormData; onChange: (patch: Partial<FormData>) => void }) {
  const customers = getCustomers()

  function prefill(customerId: string) {
    if (!customerId) return
    const rec = customers.find(r => r.customer.id === customerId)
    if (!rec) return
    const { customer } = rec
    onChange({
      customerName:    customer.name,
      customerEmail:   customer.email,
      customerPhone:   customer.phone,
      customerCompany: customer.company ?? '',
    })
  }

  return (
    <div className="space-y-5">
      <Field label="Existing customer (optional)">
        <select
          className={inputCls}
          defaultValue=""
          onChange={e => prefill(e.target.value)}
        >
          <option value="">— Select to pre-fill —</option>
          {customers.map(({ customer }) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}{customer.company ? ` · ${customer.company}` : ''}
            </option>
          ))}
        </select>
      </Field>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Full name" required>
          <input className={inputCls} placeholder="Anna Schmidt" value={form.customerName}
            onChange={e => onChange({ customerName: e.target.value })} />
        </Field>
        <Field label="Company">
          <input className={inputCls} placeholder="Müller GmbH (optional)" value={form.customerCompany}
            onChange={e => onChange({ customerCompany: e.target.value })} />
        </Field>
        <Field label="Phone" required>
          <input className={inputCls} placeholder="+49 170 1234567" value={form.customerPhone}
            onChange={e => onChange({ customerPhone: e.target.value })} />
        </Field>
        <Field label="Email" required>
          <input className={inputCls} placeholder="anna@example.de" value={form.customerEmail}
            onChange={e => onChange({ customerEmail: e.target.value })} />
        </Field>
      </div>
    </div>
  )
}

// ─── Step 2: Vehicle ──────────────────────────────────────────────────────────

function StepVehicle({ form, onChange }: { form: FormData; onChange: (patch: Partial<FormData>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Make" required>
        <input className={inputCls} placeholder="BMW" value={form.vehicleMake}
          onChange={e => onChange({ vehicleMake: e.target.value })} />
      </Field>
      <Field label="Model" required>
        <input className={inputCls} placeholder="3 Series" value={form.vehicleModel}
          onChange={e => onChange({ vehicleModel: e.target.value })} />
      </Field>
      <Field label="Year" required>
        <input className={inputCls} placeholder="2021" type="number" min="1980" max="2030"
          value={form.vehicleYear} onChange={e => onChange({ vehicleYear: e.target.value })} />
      </Field>
      <Field label="License plate" required>
        <input className={inputCls} placeholder="M-AB 1234" value={form.vehicleLicensePlate}
          onChange={e => onChange({ vehicleLicensePlate: e.target.value })} />
      </Field>
      <Field label="Color" required>
        <input className={inputCls} placeholder="Alpine White" value={form.vehicleColor}
          onChange={e => onChange({ vehicleColor: e.target.value })} />
      </Field>
      <Field label="Mileage (km)" required>
        <input className={inputCls} placeholder="48 000" type="number" min="0"
          value={form.vehicleMileage} onChange={e => onChange({ vehicleMileage: e.target.value })} />
      </Field>
      <Field label="VIN (optional)" >
        <input className={inputCls} placeholder="WBA3A5G5X…" value={form.vehicleVin}
          onChange={e => onChange({ vehicleVin: e.target.value })} />
      </Field>
    </div>
  )
}

// ─── Step 3: Complaint ────────────────────────────────────────────────────────

function StepComplaint({ form, onChange }: { form: FormData; onChange: (patch: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Customer complaint" required>
        <textarea
          className={cn(inputCls, 'resize-none h-32')}
          placeholder="Describe the issue the customer reported…"
          value={form.complaint}
          onChange={e => onChange({ complaint: e.target.value })}
        />
      </Field>

      <Field label="Priority" required>
        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(PRIORITY_CONFIG) as [ServiceOrderPriority, { label: string; color: string }][]).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ priority: key })}
              className={cn(
                'rounded-lg border-2 py-2.5 text-xs font-semibold transition-all',
                form.priority === key
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>
    </div>
  )
}

// ─── Step 4: Review ───────────────────────────────────────────────────────────

function StepReview({ form }: { form: FormData }) {
  const { label: priorityLabel, color: priorityColor } = PRIORITY_CONFIG[form.priority]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Customer */}
        <div className="rounded-lg border bg-slate-50 p-4 space-y-2 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Customer</p>
          <p className="font-semibold text-slate-900">{form.customerName}</p>
          {form.customerCompany && (
            <p className="flex items-center gap-1.5 text-slate-600">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />{form.customerCompany}
            </p>
          )}
          <p className="flex items-center gap-1.5 text-slate-600">
            <Phone className="h-3.5 w-3.5 text-slate-400" />{form.customerPhone}
          </p>
          <p className="flex items-center gap-1.5 text-slate-600">
            <Mail className="h-3.5 w-3.5 text-slate-400" />{form.customerEmail}
          </p>
        </div>

        {/* Vehicle */}
        <div className="rounded-lg border bg-slate-50 p-4 space-y-2 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Vehicle</p>
          <p className="font-semibold text-slate-900">
            {form.vehicleYear} {form.vehicleMake} {form.vehicleModel}
          </p>
          <p className="text-slate-600">{form.vehicleColor}</p>
          <p className="text-slate-600">{form.vehicleLicensePlate}</p>
          <p className="text-slate-600">{Number(form.vehicleMileage).toLocaleString('de-DE')} km</p>
          {form.vehicleVin && (
            <p className="font-mono text-xs text-slate-400">{form.vehicleVin}</p>
          )}
        </div>
      </div>

      {/* Complaint */}
      <div className="rounded-lg border bg-slate-50 p-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Complaint</p>
          <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', priorityColor)}>
            {priorityLabel}
          </span>
        </div>
        <p className="text-slate-700">{form.complaint}</p>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Order will be created with status <span className="font-medium text-slate-600">Received</span> · Estimated completion in 3 days
      </p>
    </div>
  )
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export default function NewServiceOrder() {
  const navigate = useNavigate()
  const { addOrder } = useServiceOrders()
  const [step, setStep]   = useState(0)
  const [form, setForm]   = useState<FormData>(INITIAL_FORM)

  function onChange(patch: Partial<FormData>) {
    setForm(prev => ({ ...prev, ...patch }))
  }

  function handleSubmit() {
    const now        = new Date().toISOString()
    const completion = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    const ts         = Date.now()

    const newOrder: ServiceOrder = {
      id:                  `so-${ts}`,
      orderNumber:         `SO-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`,
      status:              'received',
      priority:            form.priority,
      createdAt:           now,
      updatedAt:           now,
      estimatedCompletion: completion,
      vehicle: {
        id:           `v-${ts}`,
        make:         form.vehicleMake,
        model:        form.vehicleModel,
        year:         parseInt(form.vehicleYear),
        licensePlate: form.vehicleLicensePlate,
        color:  form.vehicleColor,
        mileage:      parseInt(form.vehicleMileage),
        vin:          form.vehicleVin,
      },
      customer: {
        id:      `c-${ts}`,
        name:    form.customerName,
        email:   form.customerEmail,
        phone:   form.customerPhone,
        company: form.customerCompany || undefined,
      },
      complaint:  form.complaint,
      laborItems: [],
      partItems:  [],
    }

    addOrder(newOrder)
    toast.success(`Order ${newOrder.orderNumber} created`, {
      description: `${newOrder.vehicle.make} ${newOrder.vehicle.model} · ${newOrder.customer.name}`,
    })
    navigate(`/service-orders/${newOrder.id}`)
  }

  const valid = isStepValid(step, form)

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white px-8 py-4">
        <button
          onClick={() => navigate('/service-orders')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </button>
        <h1 className="text-xl font-semibold text-slate-900">New Service Order</h1>
        <p className="text-sm text-slate-500 mt-0.5">Step {step + 1} of {STEPS.length}</p>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-8 space-y-8">
        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* Form card */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            {step === 0 && <StepCustomer  form={form} onChange={onChange} />}
            {step === 1 && <StepVehicle   form={form} onChange={onChange} />}
            {step === 2 && <StepComplaint form={form} onChange={onChange} />}
            {step === 3 && <StepReview    form={form} />}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => step === 0 ? navigate('/service-orders') : setStep(s => s - 1)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!valid}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              Create Order
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
