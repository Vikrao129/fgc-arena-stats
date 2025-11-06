import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Tournament {
  name: string;
  startAt: number;
  numAttendees: number;
  events: Array<{
    name: string;
    standings: Array<{
      placement: number;
      entrant: {
        name: string;
      };
    }>;
  }>;
}

const TwoXKOTournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTournaments();
  }, [page]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-2xko-tournaments', {
        body: { page }
      });

      if (error) throw error;
      
      setTournaments(data?.tournaments || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/games')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Games
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-8">2XKO Tournaments</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tournaments...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tournaments found</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tournaments.map((tournament, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{tournament.name}</CardTitle>
                    {tournament.events[0]?.standings[0] && (
                      <p className="text-sm text-muted-foreground">
                        Winner: {tournament.events[0].standings[0].entrant.name}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        📅 {formatDate(tournament.startAt)}
                      </p>
                      <p className="text-muted-foreground">
                        👥 {tournament.numAttendees} participants
                      </p>
                      
                      {tournament.events[0] && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="font-semibold mb-2">Top Players:</p>
                          <ul className="space-y-1">
                            {tournament.events[0].standings.slice(0, 3).map((standing) => (
                              <li key={standing.placement} className="text-sm">
                                #{standing.placement} - {standing.entrant.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="flex items-center px-4 text-muted-foreground">
                Page {page}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={tournaments.length === 0}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default TwoXKOTournaments;
