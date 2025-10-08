import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const START_GG_API_TOKEN = Deno.env.get('START_GG_API_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching player stats from start.gg API...');

    // Lighter query to stay under start.gg complexity limits
    const playersQuery = `
      query TopPlayers($perPage: Int!, $gameIds: [ID]) {
        tournaments(query: {
          perPage: $perPage
          sortBy: "startAt desc"
          filter: { past: true, videogameIds: $gameIds }
        }) {
          nodes {
            events {
              videogame { id name }
              standings(query: { perPage: 8, page: 1 }) {
                nodes {
                  placement
                  entrant { name }
                }
              }
            }
          }
        }
      }
    `;

    // Primary variables (kept conservative), with a fallback for complexity errors
    const primaryVars = { perPage: 12, gameIds: [43868, 49783] }; // SF6 + Tekken 8
    const fallbackVars = { perPage: 6, gameIds: [43868, 49783] };

    const runQuery = async (variables: any) => {
      console.log('Querying start.gg API with variables:', JSON.stringify(variables));
      const response = await fetch('https://api.start.gg/gql/alpha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${START_GG_API_TOKEN}`,
        },
        body: JSON.stringify({ query: playersQuery, variables }),
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        console.error('Non-JSON response from start.gg:', text.slice(0, 500));
        throw new Error(`Invalid JSON from start.gg (status ${response.status})`);
      }

      console.log('API Response received:', JSON.stringify(data).substring(0, 500));
      return { ok: response.ok, data };
    };

    // Try primary, then fallback on complexity error
    let { ok, data } = await runQuery(primaryVars);
    if (!ok || data?.errors) {
      const msg = data?.errors?.[0]?.message || `HTTP ${ok}`;
      console.warn('Primary query failed, attempting fallback. Reason:', msg);
      const res2 = await runQuery(fallbackVars);
      ok = res2.ok;
      data = res2.data;
    }

    // Validate structure after attempts
    if (!data || !data.data || !data.data.tournaments || !data.data.tournaments.nodes) {
      console.error('Invalid API response structure:', data);
      // Return graceful empty payload instead of 500 to avoid client error toast
      return new Response(
        JSON.stringify({ error: 'Invalid response from start.gg API', players: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the data to aggregate player statistics
    const playerStats = new Map<string, any>();

    data.data.tournaments.nodes.forEach((tournament: any) => {
      tournament.events?.forEach((event: any) => {
        const rawName: string = event?.videogame?.name || '';
        const gameName = rawName === 'TEKKEN 8' ? 'Tekken 8' : rawName;

        event.standings?.nodes?.forEach((standing: any) => {
          const entrant = standing?.entrant;
          const displayName: string = entrant?.name || 'Unknown';
          const playerKey = displayName;

          if (!playerStats.has(playerKey)) {
            playerStats.set(playerKey, {
              id: displayName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              name: displayName,
              country: '🌍', // Country omitted to reduce query complexity
              games: new Set<string>([gameName]),
              tournaments: 0,
              wins: 0,
              placements: [] as number[],
              achievements: new Set<string>(),
            });
          }

          const stats = playerStats.get(playerKey);
          stats.games.add(gameName);
          stats.tournaments++;
          stats.placements.push(standing?.placement);

          if (standing?.placement === 1) {
            stats.wins++;
            stats.achievements.add(`${gameName} Champion`);
          } else if (standing?.placement <= 3) {
            stats.achievements.add(`${gameName} Top 3`);
          }
        });
      });
    });

    // Convert to array and calculate win rates
    const players = Array.from(playerStats.values())
      .map((player) => ({
        id: player.id,
        name: player.name,
        country: player.country,
        games: Array.from(player.games),
        tournaments: player.tournaments,
        wins: player.wins,
        winRate: player.tournaments > 0 ? ((player.wins / player.tournaments) * 100).toFixed(1) : '0.0',
        totalEarnings: player.wins * 10000 + player.tournaments * 2000, // Estimated
        achievements: Array.from(player.achievements).slice(0, 3),
      }))
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return parseFloat(b.winRate) - parseFloat(a.winRate);
      })
      .slice(0, 20); // Top 20 players

    console.log(`Returning ${players.length} players`);
    return new Response(JSON.stringify(players), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in get-player-stats function:', error);
    // Graceful empty payload with message
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error', players: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
