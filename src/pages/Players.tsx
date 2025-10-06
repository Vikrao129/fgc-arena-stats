import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, ArrowLeft, Medal, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

interface Player {
  id: string;
  name: string;
  country: string;
  games: string[];
  tournaments: number;
  wins: number;
  winRate: string;
  totalEarnings: number;
  achievements: string[];
}

const Players = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-player-stats');
      
      if (error) {
        console.error('Error fetching player stats:', error);
        return;
      }

      if (data && Array.isArray(data)) {
        setPlayers(data);
      }
    } catch (error) {
      console.error('Error fetching player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEarnings = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPlayerRank = (index: number) => {
    return `#${index + 1}`;
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
            <span className="text-5xl">🏆</span>
            Top Pro Players
          </h1>
          <p className="text-muted-foreground">
            Rankings and statistics for the world's best fighting game players
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : players.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">No player data available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {players.map((player, index) => (
              <Card key={player.id} className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300 group">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs border-accent text-accent">
                      {getPlayerRank(index)}
                    </Badge>
                    <span className="text-2xl">{player.country}</span>
                  </div>
                  <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold text-lg">
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{player.name}</CardTitle>
                  <div className="flex flex-wrap gap-1 justify-center mt-2">
                    {player.games.map((game, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {game}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-3 rounded bg-muted/30">
                      <div className="font-bold text-accent text-lg">{player.tournaments}</div>
                      <div className="text-xs text-muted-foreground">Tournaments</div>
                    </div>
                    <div className="text-center p-3 rounded bg-muted/30">
                      <div className="font-bold text-secondary text-lg">{player.wins}</div>
                      <div className="text-xs text-muted-foreground">Wins</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-3 rounded bg-muted/30">
                      <div className="font-bold text-primary text-lg">{player.winRate}%</div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="text-center p-3 rounded bg-primary/10">
                      <div className="font-bold text-primary text-sm">{formatEarnings(player.totalEarnings)}</div>
                      <div className="text-xs text-muted-foreground">Estimated</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      Recent Achievements
                    </div>
                    {player.achievements.length === 0 ? (
                      <div className="text-xs text-muted-foreground py-2">No achievements recorded</div>
                    ) : (
                      <div className="space-y-1">
                        {player.achievements.slice(0, 3).map((achievement, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs bg-muted/20 p-2 rounded">
                            <Medal className="h-3 w-3 text-accent flex-shrink-0" />
                            <span className="truncate">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Players;
