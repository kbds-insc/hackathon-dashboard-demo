import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/useAuth';
import { apiFetchParticipantByEmail } from '../api/participants';
import { apiFetchTeamById } from '../api/teams';
import type { Participant } from '../data/mockData';
import type { TeamRow } from '../api/teams';

export interface CurrentParticipant {
  participant: Participant | null;
  team: TeamRow | null;
  loading: boolean;
}

export function useCurrentParticipant(): CurrentParticipant {
  const { user } = useAuth();
  const email = user?.email ?? null;
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [team, setTeam] = useState<TeamRow | null>(null);
  const [loading, setLoading] = useState(Boolean(email));

  useEffect(() => {
    if (!email) return;

    let cancelled = false;
    const currentEmail = email;
    async function load() {
      setLoading(true);
      const p = await apiFetchParticipantByEmail(currentEmail);
      if (cancelled) return;
      setParticipant(p);
      if (p?.team) {
        const t = await apiFetchTeamById(p.team);
        if (!cancelled) setTeam(t);
      } else {
        if (!cancelled) setTeam(null);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [email]);

  return {
    participant: email ? participant : null,
    team: email ? team : null,
    loading: email ? loading : false,
  };
}
