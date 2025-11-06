import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log('Fetching SF6 tournaments from start.gg API...');

    const START_GG_API_TOKEN = Deno.env.get('START_GG_API_TOKEN');
    if (!START_GG_API_TOKEN) {
      throw new Error('START_GG_API_TOKEN not configured');
    }

    const { page = 1, perPage = 20 } = await req.json().catch(() => ({ page: 1, perPage: 20 }));

    const SF6_GAME_ID = 43868;

    const query = `
      query GetSF6Tournaments($perPage: Int!, $page: Int!, $gameId: ID!) {
        tournaments(query: {
          perPage: $perPage
          page: $page
          sortBy: "startAt desc"
          filter: {
            past: true
            videogameIds: [$gameId]
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
              standings(query: { perPage: 8 }) {
                nodes {
                  placement
                  entrant {
                    name
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      perPage,
      page,
      gameId: SF6_GAME_ID
    };

    console.log('Query variables:', JSON.stringify(variables, null, 2));

    const response = await fetch('https://api.start.gg/gql/alpha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${START_GG_API_TOKEN}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`start.gg API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('API Response received');

    if (result.errors) {
      console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
      throw new Error('GraphQL query failed');
    }

    const tournaments = result.data?.tournaments?.nodes || [];
    
    // Transform the data
    const transformedData = tournaments.map((tournament: any) => {
      const sf6Events = tournament.events.filter((e: any) => 
        e.videogame?.id === SF6_GAME_ID
      );

      return {
        id: tournament.id,
        name: tournament.name,
        slug: tournament.slug,
        startAt: tournament.startAt,
        endAt: tournament.endAt,
        numAttendees: tournament.numAttendees,
        events: sf6Events.map((event: any) => ({
          id: event.id,
          name: event.name,
          game: 'Street Fighter 6',
          gameId: SF6_GAME_ID,
          topPlayers: (event.standings?.nodes || []).map((standing: any) => ({
            placement: standing.placement,
            name: standing.entrant?.name || 'TBD'
          }))
        }))
      };
    });

    console.log(`Returning ${transformedData.length} SF6 tournaments`);

    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-sf6-tournaments function:', error);
    const message = (error as Error)?.message ?? 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
