/** Client-side checks mirroring the server rules (the server always re-validates). */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s-]{6,40}$/;

export function validateQuote(v) {
  const e = {};
  if (!v.fullName?.trim() || v.fullName.trim().length < 2) e.fullName = 'Please enter your full name';
  if (!EMAIL.test(v.email || '')) e.email = 'Please enter a valid email address';
  if (!PHONE.test((v.phone || '').trim())) e.phone = 'Please enter a valid phone number';
  if (!v.problemDescription?.trim() || v.problemDescription.trim().length < 10) e.problemDescription = 'Please describe the problem (at least 10 characters)';
  return e;
}

export function validateContact(v) {
  const e = {};
  if (!v.name?.trim() || v.name.trim().length < 2) e.name = 'Please enter your name';
  if (!EMAIL.test(v.email || '')) e.email = 'Please enter a valid email address';
  if (v.phone && !PHONE.test(v.phone.trim())) e.phone = 'Please enter a valid phone number';
  if (!v.message?.trim() || v.message.trim().length < 10) e.message = 'Please enter a message (at least 10 characters)';
  return e;
}

/** Moves focus to the first invalid field so keyboard and screen-reader users land on it. */
export function focusFirstError(formEl) {
  requestAnimationFrame(() => formEl?.querySelector('[aria-invalid="true"]')?.focus());
}
