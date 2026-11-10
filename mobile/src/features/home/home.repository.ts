import { supabase } from "../../lib/supabase";

export type TournamentSummary = {
  id: string;
  title: string;
  registration_open: boolean;
  created_at: string;
};

export type PublishedMatchSummary = {
  id: string;
  tier: number;
  round_number: number;
  status: string;
  published: boolean;
  tournament_id: string | null;
  created_at: string;
};

export async function getTournaments(): Promise<TournamentSummary[]> {
  const { data, error } = await supabase
    .from("tournaments")
    .select("id,title,registration_open,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TournamentSummary[];
}

export async function getPublishedMatches(): Promise<PublishedMatchSummary[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("id,tier,round_number,status,published,tournament_id,created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PublishedMatchSummary[];
}
