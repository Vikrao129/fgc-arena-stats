import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Users, Trophy, Loader2, ExternalLink } from "lucide-react";

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

const SF6Tournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('get-sf6-tournaments', {
          body: { page: currentPage, perPage: itemsPerPage }
        });
        
        if (error) {
          console.error('Error fetching SF6 tournaments:', error);
          return;
        }

        if (data && Array.isArray(data)) {
          setTournaments(data);
        }
      } catch (error) {
        console.error('Error fetching SF6 tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [currentPage]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalPages = Math.ceil(tournaments.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Street Fighter 6 Tournaments
          </h1>
          <p className="text-muted-foreground">
            Browse all recent Street Fighter 6 tournament results and standings
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tournaments.length === 0 ? (
          <Card className="bg-gradient-card border-border shadow-card">
            <CardContent className="py-16 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No tournaments found</h3>
              <p className="text-muted-foreground">
                Check back later for upcoming Street Fighter 6 tournaments
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <span className="text-3xl">🥊</span>
                  <span>Tournament Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tournament</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Participants</TableHead>
                        <TableHead>Winner</TableHead>
                        <TableHead>Top Placings</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tournaments.map((tournament) => {
                        const event = tournament.events[0];
                        const winner = event?.topPlayers?.[0];
                        const topPlayers = event?.topPlayers?.slice(1, 4) || [];

                        return (
                          <TableRow key={tournament.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {tournament.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-2" />
                                {formatDate(tournament.startAt)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center text-muted-foreground">
                                <Users className="h-4 w-4 mr-2" />
                                {tournament.numAttendees}
                              </div>
                            </TableCell>
                            <TableCell>
                              {winner && (
                                <Badge variant="default" className="bg-gradient-primary">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  {winner.name}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {topPlayers.map((player, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {player.placement}. {player.name}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={`https://start.gg/${tournament.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SF6Tournaments;
