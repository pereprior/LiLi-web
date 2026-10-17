import type { User } from '#src/auth/types/user.type.js';
import { request } from '#src/shared/http/http-client.js';

function isUser(value: unknown): value is User {
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

export const authApi = {
  me(this: void, signal?: AbortSignal): Promise<User> {
    return request<User>(
      '/auth/me',
      { cache: 'no-store', ...(signal ? { signal } : {}) },
      isUser,
    );
  },

  logout(this: void): Promise<void> {
    return request<void>('/auth/logout', { method: 'POST' });
  },
};
