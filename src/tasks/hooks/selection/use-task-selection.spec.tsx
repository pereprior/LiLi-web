import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { describe, expect, it } from 'vitest';

import { useTaskSelection } from '#src/tasks/hooks/selection/use-task-selection.js';

function SelectionProbe(): ReactElement {
  const { selectedUuid, selectTask } = useTaskSelection();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <output aria-label="Selected task">{selectedUuid ?? 'none'}</output>
      <output aria-label="Current URL">
        {`${location.pathname}${location.search}${location.hash}`}
      </output>
      <button onClick={() => selectTask('first-task')}>
        Select first task
      </button>
      <button onClick={() => selectTask('second-task')}>
        Select second task
      </button>
      <button onClick={() => selectTask(null)}>Clear selection</button>
      <button onClick={() => void navigate(-1)}>Back</button>
      <button onClick={() => void navigate(1)}>Forward</button>
    </>
  );
}

describe('useTaskSelection', () => {
  describe('URL selection', () => {
    it.each([
      ['/', 'none'],
      ['/?task=first-task', 'first-task'],
    ])('reads the selected task from %s', (entry, selected) => {
      render(
        <MemoryRouter initialEntries={[entry]}>
          <SelectionProbe />
        </MemoryRouter>,
      );

      expect(screen.getByLabelText('Selected task').textContent).toBe(selected);
      expect(screen.getByLabelText('Current URL').textContent).toBe(entry);
    });

    it('changes the selection while retaining other parameters and the hash', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter
          initialEntries={[
            '/?tag=home&tag=family&task=first-task#main-content',
          ]}
        >
          <SelectionProbe />
        </MemoryRouter>,
      );

      await user.click(
        screen.getByRole('button', { name: 'Select second task' }),
      );

      expect(screen.getByLabelText('Selected task').textContent).toBe(
        'second-task',
      );
      expect(screen.getByLabelText('Current URL').textContent).toBe(
        '/?tag=home&tag=family&task=second-task#main-content',
      );
    });

    it.each([
      [
        '/?tag=home&tag=family&task=first-task#main-content',
        '/?tag=home&tag=family#main-content',
      ],
      ['/?task=first-task#main-content', '/#main-content'],
    ])('clears only the task selection from %s', async (entry, expectedUrl) => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={[entry]}>
          <SelectionProbe />
        </MemoryRouter>,
      );

      await user.click(screen.getByRole('button', { name: 'Clear selection' }));

      expect(screen.getByLabelText('Selected task').textContent).toBe('none');
      expect(screen.getByLabelText('Current URL').textContent).toBe(
        expectedUrl,
      );
    });
  });

  describe('history navigation', () => {
    it('follows back and forward through task selections', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/']}>
          <SelectionProbe />
        </MemoryRouter>,
      );
      await user.click(
        screen.getByRole('button', { name: 'Select first task' }),
      );
      await user.click(
        screen.getByRole('button', { name: 'Select second task' }),
      );

      await user.click(screen.getByRole('button', { name: 'Back' }));

      expect(screen.getByLabelText('Selected task').textContent).toBe(
        'first-task',
      );
      expect(screen.getByLabelText('Current URL').textContent).toBe(
        '/?task=first-task',
      );

      await user.click(screen.getByRole('button', { name: 'Forward' }));

      expect(screen.getByLabelText('Selected task').textContent).toBe(
        'second-task',
      );
      expect(screen.getByLabelText('Current URL').textContent).toBe(
        '/?task=second-task',
      );
    });

    it.each([
      {
        name: 'selecting the current task',
        entries: ['/', '/?task=first-task'],
        button: 'Select first task',
        previousUrl: '/',
        previousSelection: 'none',
      },
      {
        name: 'clearing an absent selection',
        entries: ['/?task=first-task', '/'],
        button: 'Clear selection',
        previousUrl: '/?task=first-task',
        previousSelection: 'first-task',
      },
    ])(
      'keeps history unchanged when $name',
      async ({ entries, button, previousUrl, previousSelection }) => {
        const user = userEvent.setup();
        render(
          <MemoryRouter initialEntries={entries}>
            <SelectionProbe />
          </MemoryRouter>,
        );

        await user.click(screen.getByRole('button', { name: button }));
        await user.click(screen.getByRole('button', { name: 'Back' }));

        expect(screen.getByLabelText('Selected task').textContent).toBe(
          previousSelection,
        );
        expect(screen.getByLabelText('Current URL').textContent).toBe(
          previousUrl,
        );
      },
    );
  });
});
