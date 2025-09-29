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
    console.log('Fetching tournaments from start.gg API...');

    // GraphQL query to get recent tournaments
    const query = `
      query RecentTournaments($perPage: Int!, $page: Int!) {
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
            slug
            startAt
            endAt
            numAttendees
            events {
              id
              name
              videogame {
                id
                name
              }
              standings(query: {perPage: 3, page: 1}) {
                nodes {
                  placement
                  entrant {
                    name
                    participants {
                      gamerTag
                      user {
                        name
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
      perPage: 10,
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
    console.log('Start.gg API response:', JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error('GraphQL query failed');
    }

    // Transform the data to match our existing format
    const transformedData = data.data.tournaments.nodes.map((tournament: any) => {
      const events = tournament.events || [];
      
      return {
        id: tournament.id,
        name: tournament.name,
        slug: tournament.slug,
        startAt: tournament.startAt,
        endAt: tournament.endAt,
        numAttendees: tournament.numAttendees,
        events: events.map((event: any) => ({
          id: event.id,
          name: event.name,
          game: event.videogame?.name || 'Unknown Game',
          gameId: event.videogame?.id,
          topPlayers: (event.standings?.nodes || []).map((standing: any) => ({
            placement: standing.placement,
            name: standing.entrant?.participants?.[0]?.gamerTag || 
                  standing.entrant?.participants?.[0]?.user?.name || 
                  standing.entrant?.name || 'Unknown Player'
          }))
        }))
      };
    });

    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in get-tournaments function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        tournaments: [] // Return empty array as fallback
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});