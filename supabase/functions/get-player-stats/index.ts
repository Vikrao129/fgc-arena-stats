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

    // Query to get top players from recent tournaments
    const playersQuery = `
      query TopPlayers($perPage: Int!, $gameIds: [ID]) {
        tournaments(query: {
          perPage: $perPage
          sortBy: "startAt desc"
          filter: {
            past: true
            videogameIds: $gameIds
          }
        }) {
          nodes {
            events {
              videogame {
                id
                name
              }
              standings(query: {perPage: 8, page: 1}) {
                nodes {
                  placement
                  entrant {
                    name
                    participants {
                      gamerTag
                      prefix
                      user {
                        location {
                          country
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      perPage: 20,
      gameIds: [43868, 49783] // Street Fighter 6 and Tekken 8
    };

    console.log('Querying start.gg API with variables:', JSON.stringify(variables));

    const response = await fetch('https://api.start.gg/gql/alpha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${START_GG_API_TOKEN}`,
      },
      body: JSON.stringify({
        query: playersQuery,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response received:', JSON.stringify(data).substring(0, 500));

    // Check if data exists and has the expected structure
    if (!data || !data.data || !data.data.tournaments || !data.data.tournaments.nodes) {
      console.error('Invalid API response structure:', data);
      throw new Error('Invalid response from start.gg API');
    }

    // Process the data to aggregate player statistics
    const playerStats = new Map();

    data.data.tournaments.nodes.forEach((tournament: any) => {
      tournament.events.forEach((event: any) => {
        const gameName = event.videogame.name === 'TEKKEN 8' ? 'Tekken 8' : 
                        event.videogame.name === 'Street Fighter 6' ? 'Street Fighter 6' : 
                        event.videogame.name;

        event.standings.nodes.forEach((standing: any) => {
          const entrant = standing.entrant;
          const participant = entrant.participants?.[0];
          const playerName = participant?.gamerTag || entrant.name;
          const prefix = participant?.prefix || '';
          const displayName = prefix ? `${prefix} | ${playerName}` : playerName;
          const country = participant?.user?.location?.country || '🌍';

          if (!playerStats.has(playerName)) {
            playerStats.set(playerName, {
              id: playerName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              name: displayName,
              country: country,
              games: new Set([gameName]),
              tournaments: 0,
              wins: 0,
              placements: [],
              achievements: new Set()
            });
          }

          const stats = playerStats.get(playerName);
          stats.games.add(gameName);
          stats.tournaments++;
          stats.placements.push(standing.placement);

          if (standing.placement === 1) {
            stats.wins++;
            stats.achievements.add(`${gameName} Champion`);
          } else if (standing.placement <= 3) {
            stats.achievements.add(`${gameName} Top 3`);
          }
        });
      });
    });

    // Convert to array and calculate win rates
    const players = Array.from(playerStats.values())
      .map(player => ({
        id: player.id,
        name: player.name,
        country: player.country,
        games: Array.from(player.games),
        tournaments: player.tournaments,
        wins: player.wins,
        winRate: ((player.wins / player.tournaments) * 100).toFixed(1),
        totalEarnings: player.wins * 10000 + player.tournaments * 2000, // Estimated
        achievements: Array.from(player.achievements).slice(0, 3)
      }))
      .sort((a, b) => {
        // Sort by wins first, then by win rate
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
    return new Response(
      JSON.stringify({ 
        error: error.message,
        players: [] // Return empty array as fallback
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});