import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Users, Trophy, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

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

const Tekken8Tournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    fetchTournaments();
  }, [page]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-tekken8-tournaments', {
        body: { page, perPage }
      });

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <span className="text-5xl">👊</span>
            Tekken 8 Tournaments
          </h1>
          <p className="text-muted-foreground">
            Browse all recent Tekken 8 tournament results
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : tournaments.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">No tournaments found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 mb-8">
              {tournaments.map((tournament) => (
                <Card key={tournament.id} className="bg-gradient-card border-border shadow-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{tournament.name}</CardTitle>
                      {tournament.events[0]?.topPlayers?.[0] && (
                        <Badge variant="secondary" className="text-sm">
                          <Trophy className="h-4 w-4 mr-1" />
                          Winner: {tournament.events[0].topPlayers[0].name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(tournament.startAt)}
                        {tournament.endAt && tournament.endAt !== tournament.startAt && 
                          ` - ${formatDate(tournament.endAt)}`
                        }
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {tournament.numAttendees} participants
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {tournament.events[0]?.topPlayers && tournament.events[0].topPlayers.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-sm">Top Placements:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {tournament.events[0].topPlayers.slice(0, 8).map((player, index) => (
                            <div 
                              key={index}
                              className="p-3 rounded-lg bg-muted/30 flex items-center gap-2"
                            >
                              <Badge variant="outline" className="text-xs">
                                {player.placement}
                              </Badge>
                              <span className="text-sm truncate">{player.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled
              >
                Page {page}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={tournaments.length < perPage}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Tekken8Tournaments;
