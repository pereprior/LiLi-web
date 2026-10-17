import { useEffect, useState } from 'react';

function readSelection(): string | null {
  return new URLSearchParams(window.location.search).get('task');
}

export function useTaskSelection(): {
  selectedUuid: string | null;
  selectTask: (uuid: string | null) => void;
} {
  const [selectedUuid, setSelectedUuid] = useState(readSelection);

  useEffect(() => {
    const onPopState = (): void => setSelectedUuid(readSelection());
    window.addEventListener('popstate', onPopState);
    return (): void => window.removeEventListener('popstate', onPopState);
  }, []);

  function selectTask(uuid: string | null): void {
    const url = new URL(window.location.href);
    if (uuid) url.searchParams.set('task', uuid);
    else url.searchParams.delete('task');
    if (url.href !== window.location.href)
      window.history.pushState(null, '', url);
    setSelectedUuid(uuid);
  }

  return { selectedUuid, selectTask };
}
