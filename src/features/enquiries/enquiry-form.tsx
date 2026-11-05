'use client'

import { useActionState, useId, useState } from 'react'
import { MessageCircle, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createEnquiryAction,
  type EnquiryActionState,
} from './enquiry-actions'

const initialEnquiryState: EnquiryActionState = { status: 'idle' }

const topics = [
  { value: 'accommodation', label: 'Accommodation availability' },
  { value: 'function', label: 'Function package' },
  { value: 'specials', label: 'Current specials' },
  { value: 'day-service', label: 'Day service or shoot quote' },
  { value: 'general', label: 'General question' },
]

export function EnquiryForm() {
  const [state, formAction, isPending] = useActionState(
    createEnquiryAction,
    initialEnquiryState,
  )
  const [topic, setTopic] = useState('general')
  const formId = useId()

  return (
    <div className="enquiry-form-wrap">
      <div className="enquiry-form__heading">
        <h3>Send an enquiry</h3>
      </div>

      {state.status === 'success' ? (
        <div className="enquiry-success" role="status">
          <MessageCircle aria-hidden="true" size={19} strokeWidth={1.6} />
          <p>{state.message}</p>
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div className="form-error form-error--light" role="alert">
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="enquiry-form">
        <input type="hidden" name="topic" value={topic} />
        <div className="form-honeypot" aria-hidden="true" hidden>
          <label htmlFor={`${formId}-website`}>Leave this field empty</label>
          <input
            id={`${formId}-website`}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="enquiry-form__row">
          <div className="form-field">
            <Label htmlFor="enquiry-name">Full name</Label>
            <Input
              id="enquiry-name"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              aria-invalid={Boolean(state.fieldErrors?.fullName)}
            />
            {state.fieldErrors?.fullName ? (
              <p className="field-error">{state.fieldErrors.fullName}</p>
            ) : null}
          </div>

          <div className="form-field">
            <Label htmlFor="enquiry-phone">Phone number</Label>
            <Input
              id="enquiry-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              aria-invalid={Boolean(state.fieldErrors?.phone)}
            />
            {state.fieldErrors?.phone ? (
              <p className="field-error">{state.fieldErrors.phone}</p>
            ) : null}
          </div>
        </div>

        <div className="enquiry-form__row">
          <div className="form-field">
            <Label htmlFor="enquiry-email">Email (optional)</Label>
            <Input
              id="enquiry-email"
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(state.fieldErrors?.email)}
            />
            {state.fieldErrors?.email ? (
              <p className="field-error">{state.fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="form-field">
            <Label htmlFor="enquiry-topic">Enquiry topic</Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger id="enquiry-topic">
                <SelectValue placeholder="Choose a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="form-field">
          <Label htmlFor="enquiry-date">Preferred date (optional)</Label>
          <Input
            id="enquiry-date"
            name="preferredDate"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            className="num"
          />
        </div>

        <div className="form-field">
          <Label htmlFor="enquiry-message">Message</Label>
          <Textarea
            id="enquiry-message"
            name="message"
            rows={5}
            required
            minLength={10}
            maxLength={4000}
            placeholder="Tell Mrs Ncube about the date, the occasion and how many people you expect."
            aria-invalid={Boolean(state.fieldErrors?.message)}
          />
          {state.fieldErrors?.message ? (
            <p className="field-error">{state.fieldErrors.message}</p>
          ) : null}
        </div>

        <div className="enquiry-form__actions">
          <Button type="submit" size="large" disabled={isPending} aria-busy={isPending}>
            {isPending ? 'Sending enquiry…' : 'Send enquiry'}
          </Button>
          <div className="enquiry-form__quick">
            <a href="tel:+263772964425">
              <Phone aria-hidden="true" size={15} strokeWidth={1.7} />
              <span className="num">0772 964 425</span>
            </a>
            <a
              href="https://wa.me/263772964425"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle aria-hidden="true" size={15} strokeWidth={1.7} />
              WhatsApp
            </a>
          </div>
        </div>
      </form>
    </div>
  )
}
