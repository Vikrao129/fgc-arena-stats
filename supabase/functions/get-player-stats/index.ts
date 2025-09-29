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

    // GraphQL query to get top players
    const query = `
      query TopPlayers($perPage: Int!, $page: Int!) {
        tournaments(query: {
          perPage: $perPage
          page: $page
          sortBy: "startAt desc"
          filter: {
            videogameIds: [1386, 2045]
          }
        }) {
          nodes {
            id
            name
            startAt
            events {
              id
              name
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
                      id
                      gamerTag
                      user {
                        name
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
      page: 1
    };

    const response = await fetch('https://api.start.gg/gql/alpha', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${START_GG_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      console.error('Start.gg API error:', response.status, response.statusText);
      throw new Error(`Start.gg API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Player stats API response received');

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error('GraphQL query failed');
    }

    // Process and aggregate player data
    const playerStats = new Map();
    
    data.data.tournaments.nodes.forEach((tournament: any) => {
      tournament.events?.forEach((event: any) => {
        event.standings?.nodes?.forEach((standing: any) => {
          const participant = standing.entrant?.participants?.[0];
          if (!participant) return;

          const playerId = participant.id;
          const gamerTag = participant.gamerTag || participant.user?.name || 'Unknown';
          const country = participant.user?.location?.country;
          const game = event.videogame?.name;
          const placement = standing.placement;

          if (!playerStats.has(playerId)) {
            playerStats.set(playerId, {
              id: playerId,
              name: gamerTag,
              country: country || '🌐',
              games: new Set(),
              tournaments: 0,
              wins: 0,
              topPlacements: [],
              totalEarnings: 0
            });
          }

          const player = playerStats.get(playerId);
          player.games.add(game);
          player.tournaments += 1;
          
          if (placement === 1) {
            player.wins += 1;
          }
          
          if (placement <= 3) {
            player.topPlacements.push({
              tournament: tournament.name,
              placement,
              game: game
            });
          }
          
          // Estimate earnings based on placement (this is approximate)
          if (placement === 1) player.totalEarnings += 5000;
          else if (placement === 2) player.totalEarnings += 2500;
          else if (placement === 3) player.totalEarnings += 1000;
        });
      });
    });

    // Convert to array and sort by performance metrics
    const topPlayers = Array.from(playerStats.values())
      .filter(player => player.tournaments >= 2) // Only players with multiple tournaments
      .map(player => ({
        ...player,
        games: Array.from(player.games),
        winRate: player.tournaments > 0 ? (player.wins / player.tournaments * 100).toFixed(1) : '0',
        achievements: player.topPlacements.slice(0, 3).map((p: any) => 
          `${p.tournament} (${p.placement}${p.placement === 1 ? 'st' : p.placement === 2 ? 'nd' : 'rd'})`
        )
      }))
      .sort((a, b) => {
        // Sort by wins first, then by win rate, then by tournaments
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (parseFloat(b.winRate) !== parseFloat(a.winRate)) return parseFloat(b.winRate) - parseFloat(a.winRate);
        return b.tournaments - a.tournaments;
      })
      .slice(0, 8); // Top 8 players

    return new Response(JSON.stringify(topPlayers), {
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