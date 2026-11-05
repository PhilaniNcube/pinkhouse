'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

export interface EnquiryActionState {
  status: 'idle' | 'error' | 'success'
  message?: string
  fieldErrors?: Record<string, string>
}

const enquirySchema = z.object({
  fullName: z.string().trim().min(2, 'Please write your full name.').max(120),
  phone: z.string().trim().min(6, 'Please add a phone number.').max(40),
  email: z
    .string()
    .trim()
    .email('Check the email address.')
    .optional()
    .or(z.literal('')),
  topic: z.enum([
    'accommodation',
    'function',
    'specials',
    'day-service',
    'general',
  ]),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(10, 'Tell Mrs Ncube a little about what you need.')
    .max(4000),
})

export async function createEnquiryAction(
  _previousState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  if (String(formData.get('website') || '').trim()) {
    return {
      status: 'error',
      message: 'This enquiry could not be sent. Please call Mrs Ncube.',
    }
  }

  const parsed = enquirySchema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    email: formData.get('email') || '',
    topic: formData.get('topic'),
    preferredDate: formData.get('preferredDate') || '',
    message: formData.get('message'),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] || 'form')
      if (!fieldErrors[field]) fieldErrors[field] = issue.message
    }
    return {
      status: 'error',
      message: 'Please check the highlighted details.',
      fieldErrors,
    }
  }

  const data = parsed.data
  const payload = await getPayload({ config })

  try {
    await payload.create({
      collection: 'contact-enquiries',
      depth: 0,
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || undefined,
        topic: data.topic,
        preferredDate: data.preferredDate
          ? `${data.preferredDate}T00:00:00.000Z`
          : undefined,
        message: data.message,
        status: 'new',
      },
    })

    return {
      status: 'success',
      message:
        'Your enquiry has reached Mrs Ncube. She will reply directly on the number you shared.',
    }
  } catch (error) {
    console.error('Enquiry failed', error)
    return {
      status: 'error',
      message:
        'The enquiry did not go through. Please try again or WhatsApp Mrs Ncube on 0772 964 425.',
    }
  }
}
