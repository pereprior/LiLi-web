export const common = {
  description: 'LiLi, your home assistant.',
  http: {
    connection:
      'Unable to connect to LiLi. Check your connection and try again.',
    invalidRequest: 'Check the request data.',
    unauthorized: 'Your session has expired. Sign in with Google again.',
    forbidden:
      'The operation was rejected. Check the allowed origin configuration.',
    notFound: 'This task is no longer available.',
    conflict:
      'The task has changed or the operation conflicts with its status. Reload and review the data.',
    requestFailed: 'LiLi could not complete the request. Try again.',
    invalidResponse: 'The server response has an unexpected format.',
  },
  errors: {
    forbidden:
      'The operation was rejected. Check that the web origin is allowed by the API.',
    notFound:
      'The task or its parent is no longer available. Return to the list or reload.',
    conflict:
      'The operation conflicts with the current status. We requested updated data; review the task and its subtasks before trying again. {{details}}',
    unknown: 'Unable to complete the operation. Try again.',
  },
};
