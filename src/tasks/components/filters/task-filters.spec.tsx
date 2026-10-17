import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TaskFilters } from '#src/tasks/components/filters/task-filters.js';
import { TaskStatus } from '#src/tasks/types/task-status.enum.js';

describe('TaskFilters', () => {
  it('exits a quick view when selecting manual statuses and keeps search and order', async () => {
    const onApply = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskFilters
        filters={{
          view: 'today',
          search: 'pan',
          sortBy: 'priority',
          sortDirection: 'desc',
        }}
        onApply={onApply}
      />,
    );
    await user.click(
      screen.getByRole('button', { name: 'Buscar, filtrar y ordenar +' }),
    );
    await user.click(screen.getByRole('checkbox', { name: 'Pendiente' }));
    await user.click(screen.getByRole('checkbox', { name: 'Programada' }));
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

    expect(onApply).toHaveBeenCalledWith({
      search: 'pan',
      sortBy: 'priority',
      sortDirection: 'desc',
      status: [TaskStatus.PENDING, TaskStatus.SCHEDULED],
    });
  });

  it('keeps the date draft and rejects a reversed range before making a query', async () => {
    const onApply = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskFilters
        filters={{ dateFrom: '2026-10-18', dateTo: '2026-10-12' }}
        onApply={onApply}
      />,
    );
    await user.click(
      screen.getByRole('button', { name: 'Buscar, filtrar y ordenar +' }),
    );
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

    expect(onApply).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Desde el día')).toHaveValue('2026-10-18');
    expect(
      screen.getByText('El último día no puede ser anterior al primero.'),
    ).toBeVisible();
  });
});
