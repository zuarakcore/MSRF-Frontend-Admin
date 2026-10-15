/**
 * New-password rules, mirroring backend app/core/security.py password_problem().
 * The form checks the simple rules; the API also rejects common passwords with 422 WEAK_PASSWORD.
 */
import { ApiError } from './client';

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_HINT = `At least ${PASSWORD_MIN_LENGTH} characters, not your email, and not an easy-to-guess password.`;

/** Why `password` is too weak (a user-facing sentence), or null if the form should send it. */
export function passwordProblem(password: string, email?: string | null): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  const lowered = password.trim().toLowerCase();
  if (email) {
    const address = email.trim().toLowerCase();
    if (lowered === address || lowered === address.split('@')[0]) return 'Password must not be your email address.';
  }
  if (new Set(lowered).size < 4) return 'Password must use at least 4 different characters.';
  return null;
}

/** The message to show under the new-password field, if the API rejected the password itself. */
export function newPasswordError(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  if (error.code === 'WEAK_PASSWORD') return error.message;
  const field = error.fieldErrors.find(e => /new_?password|password/i.test(e.field));
  return field ? String(field.message).replace(/^Value error, /, '') : null;
}
