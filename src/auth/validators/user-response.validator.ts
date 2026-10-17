import type { User } from '#src/auth/types/user.type.js';

export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'uuid' in value &&
    typeof value.uuid === 'string' &&
    value.uuid.length > 0 &&
    'email' in value &&
    typeof value.email === 'string' &&
    value.email.length > 0
  );
}
