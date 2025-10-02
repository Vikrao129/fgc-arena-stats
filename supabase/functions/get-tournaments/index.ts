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

    // First get the videogame IDs for Street Fighter 6 and Tekken 8
    const gameIdQuery = `
      query GetGameIds {
        streetFighter: videogames(query: {
          filter: {
            name: "Street Fighter 6"
          }
        }) {
          nodes {
            id
            name
            displayName
          }
        }
        tekken: videogames(query: {
          filter: {
            name: "Tekken 8"
          }
        }) {
          nodes {
            id
            name
            displayName
          }
        }
      }
    `;

    console.log('Getting game IDs...');
    const gameResponse = await fetch('https://api.start.gg/gql/alpha', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${START_GG_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: gameIdQuery
      })
    });

    if (!gameResponse.ok) {
      console.error('Start.gg game ID API error:', gameResponse.status, gameResponse.statusText);
      const errorText = await gameResponse.text();
      console.error('Error response:', errorText);
      throw new Error(`Start.gg API error: ${gameResponse.status}`);
    }

    const gameData = await gameResponse.json();
    console.log('Game ID response:', JSON.stringify(gameData, null, 2));

    if (gameData.errors) {
      console.error('GraphQL errors in game query:', gameData.errors);
      throw new Error('GraphQL game query failed');
    }

    // Extract game IDs
    const streetFighterGames = gameData.data?.streetFighter?.nodes || [];
    const tekkenGames = gameData.data?.tekken?.nodes || [];
    
    const gameIds: string[] = [];
    if (streetFighterGames.length > 0) gameIds.push(streetFighterGames[0].id);
    if (tekkenGames.length > 0) gameIds.push(tekkenGames[0].id);

    console.log('Found game IDs:', gameIds);

    if (gameIds.length === 0) {
      console.log('No game IDs found, using fallback data');
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Now get tournaments with the correct game IDs
    const tournamentQuery = `
      query GetTournaments($perPage: Int!, $page: Int!, $gameIds: [ID]) {
        tournaments(query: {
          perPage: $perPage
          page: $page
          sortBy: "startAt desc"
          filter: {
            past: true
            videogameIds: $gameIds
          }
        }) {
          nodes {
            id
            name
            slug
            startAt
            endAt
            numAttendees
          }
        }
      }
    `;

    const tournamentVariables = {
      perPage: 10,
      page: 1,
      gameIds: gameIds
    };

    console.log('Fetching tournaments with variables:', JSON.stringify(tournamentVariables, null, 2));

    const response = await fetch('https://api.start.gg/gql/alpha', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${START_GG_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: tournamentQuery,
        variables: tournamentVariables
      })
    });

    if (!response.ok) {
      console.error('Start.gg API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Start.gg API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Tournament API response:', JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error('GraphQL query failed');
    }

    // Transform the data to match our existing format  
    const transformedData = (data.data?.tournaments?.nodes || []).map((tournament: any) => {
      return {
        id: tournament.id,
        name: tournament.name,
        slug: tournament.slug,
        startAt: tournament.startAt,
        endAt: tournament.endAt,
        numAttendees: tournament.numAttendees || 0,
        events: [{
          id: `${tournament.id}-main`,
          name: tournament.name,
          game: 'Street Fighter 6',
          gameId: gameIds[0],
          topPlayers: [
            { placement: 1, name: 'TBD' },
            { placement: 2, name: 'TBD' },
            { placement: 3, name: 'TBD' }
          ]
        }]
      };
    });

    console.log('Transformed data:', JSON.stringify(transformedData, null, 2));

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