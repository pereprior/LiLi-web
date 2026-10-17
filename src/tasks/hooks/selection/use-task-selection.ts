import { useLocation, useNavigate } from 'react-router';

export function useTaskSelection(): {
  selectedUuid: string | null;
  selectTask: (uuid: string | null) => void;
} {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const selectedUuid = searchParams.get('task');

  function selectTask(uuid: string | null): void {
    const nextParams = new URLSearchParams(searchParams);
    if (uuid) nextParams.set('task', uuid);
    else nextParams.delete('task');

    const search = nextParams.toString();
    if (search === searchParams.toString()) return;

    void navigate({ search, hash: location.hash });
  }

  return { selectedUuid, selectTask };
}
