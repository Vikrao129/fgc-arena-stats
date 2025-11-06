import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { page = 1 } = await req.json();
    
    const authToken = Deno.env.get('START_GG_API_TOKEN');
    if (!authToken) {
      throw new Error('START_GG_API_TOKEN not configured');
    }

    // First, get the videogame ID for 2XKO
    const gameQuery = `
      query {
        videogames(query: {
          filter: {
            name: "2XKO"
          }
        }) {
          nodes {
            id
            name
          }
        }
      }
    `;

    console.log('Fetching 2XKO game ID...');
    const gameResponse = await fetch('https://api.start.gg/gql/alpha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ query: gameQuery }),
    });

    if (!gameResponse.ok) {
      throw new Error(`Failed to fetch game ID: ${gameResponse.statusText}`);
    }

    const gameData = await gameResponse.json();
    console.log('Game data:', JSON.stringify(gameData, null, 2));

    const gameId = gameData?.data?.videogames?.nodes?.[0]?.id;
    if (!gameId) {
      console.log('2XKO game not found, returning empty tournaments');
      return new Response(
        JSON.stringify({ tournaments: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found 2XKO game ID:', gameId);

    // Now fetch tournaments for this game
    const tournamentQuery = `
      query TournamentsByVideogame($perPage: Int!, $page: Int!, $videogameId: [ID]) {
        tournaments(query: {
          perPage: $perPage
          page: $page
          sortBy: "startAt desc"
          filter: {
            past: true
            videogameIds: $videogameId
          }
        }) {
          nodes {
            id
            name
            startAt
            numAttendees
            events(limit: 1) {
              id
              name
              standings(query: {
                perPage: 8
                page: 1
              }) {
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

    console.log('Fetching tournaments for game ID:', gameId, 'page:', page);
    const tournamentResponse = await fetch('https://api.start.gg/gql/alpha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        query: tournamentQuery,
        variables: {
          perPage: 12,
          page: page,
          videogameId: [gameId]
        }
      }),
    });

    if (!tournamentResponse.ok) {
      throw new Error(`Failed to fetch tournaments: ${tournamentResponse.statusText}`);
    }

    const tournamentData = await tournamentResponse.json();
    console.log('Tournament response:', JSON.stringify(tournamentData, null, 2));

    const tournaments = tournamentData?.data?.tournaments?.nodes?.map((tournament: any) => ({
      name: tournament.name,
      startAt: tournament.startAt,
      numAttendees: tournament.numAttendees || 0,
      events: tournament.events.map((event: any) => ({
        name: event.name,
        standings: event.standings?.nodes || []
      }))
    })) || [];

    console.log(`Successfully fetched ${tournaments.length} tournaments`);

    return new Response(
      JSON.stringify({ tournaments }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-2xko-tournaments function:', error);
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
