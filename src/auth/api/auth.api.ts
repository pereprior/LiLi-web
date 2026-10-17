import type { User } from '#src/auth/types/user.type.js';
import { isUser } from '#src/auth/validators/user-response.validator.js';
import { request } from '#src/shared/http/http-client.js';

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
