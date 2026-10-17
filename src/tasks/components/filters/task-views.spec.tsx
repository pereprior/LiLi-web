import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TaskViews } from '#src/tasks/components/filters/task-views.js';
import { TaskStatus } from '#src/tasks/types/task-status.enum.js';

describe('TaskViews', () => {
  it('replaces manual date and status filters while keeping search and order', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskViews
        filters={{
          status: [TaskStatus.PENDING],
          dateField: 'end',
          dateFrom: '2026-10-01',
          dateTo: '2026-10-31',
          search: 'pan',
          sortBy: 'priority',
          sortDirection: 'desc',
        }}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Hoy' }));

    expect(onChange).toHaveBeenCalledWith({
      search: 'pan',
      sortBy: 'priority',
      sortDirection: 'desc',
      view: 'today',
    });
  });

  it('uses terminal statuses instead of a quick view for closed tasks', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TaskViews filters={{ view: 'today' }} onChange={onChange} />);

    await user.click(
      screen.getByRole('button', { name: 'Completadas y canceladas' }),
    );

    expect(onChange).toHaveBeenCalledWith({
      status: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
    });
  });
});
