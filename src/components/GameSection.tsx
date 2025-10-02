import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Tournament {
  id: string;
  name: string;
  slug: string;
  startAt: number;
  endAt: number;
  numAttendees: number;
  events: Array<{
    id: string;
    name: string;
    game: string;
    gameId: number;
    topPlayers: Array<{
      placement: number;
      name: string;
    }>;
  }>;
}

const GameSection = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-tournaments');
        
        if (error) {
          console.error('Error fetching tournaments:', error);
          return;
        }

        if (data && Array.isArray(data)) {
          setTournaments(data);
        }
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  // Group tournaments by game
  const SF6_ID = 43868;
  const gameMap = new Map<string, Tournament[]>();
  tournaments.forEach(tournament => {
    tournament.events.forEach(event => {
      const gameName = event.game;
      if (!gameMap.has(gameName)) {
        gameMap.set(gameName, []);
      }
      
      // Create a tournament entry for this specific game event
      const gameSpecificTournament = {
        ...tournament,
        events: [event] // Only include this specific event
      };
      
      gameMap.get(gameName)!.push(gameSpecificTournament);
    });
  });

  // Get the top games (Street Fighter 6 and Tekken 8)
  const games = [
    {
      name: "Street Fighter 6",
      logo: "🥊",
      tournaments: gameMap.get("Street Fighter 6") || []
    },
    {
      name: "Tekken 8", 
      logo: "👊",
      tournaments: gameMap.get("Tekken 8") || []
    }
  ];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Latest Tournament Results</h2>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Latest Tournament Results</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {games.map((game) => (
            <Card key={game.name} className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <span className="text-3xl">{game.logo}</span>
                  <span className="text-xl">{game.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {game.tournaments.length === 0 ? (
                    <div className="p-4 rounded-lg bg-muted/30 text-center text-muted-foreground">
                      No recent tournaments found for {game.name}
                    </div>
                  ) : (
                    game.tournaments.slice(0, 3).map((tournament, index) => (
                      <div key={`${tournament.id}-${index}`} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground">{tournament.name}</h3>
                          {tournament.events[0]?.topPlayers?.[0] && (
                            <Badge variant="secondary" className="text-xs">
                              <Trophy className="h-3 w-3 mr-1" />
                              {tournament.events[0].topPlayers[0].name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(tournament.startAt)}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {tournament.numAttendees} players
                          </div>
                        </div>
                        {tournament.events[0]?.topPlayers && tournament.events[0].topPlayers.length > 1 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {tournament.events[0].topPlayers.slice(1, 4).map((player, playerIndex) => (
                              <Badge key={playerIndex} variant="outline" className="text-xs">
                                {player.placement}. {player.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4 border-primary/30 text-primary hover:bg-primary/10">
                  View All {game.name} Tournaments
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GameSection;