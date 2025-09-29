import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Target, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

const PlayerProfiles = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchPlayers();
  }, []);

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

  if (loading) {
    return (
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Top Pro Players</h2>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-muted/20">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Top Pro Players</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {players.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No player data available at the moment
            </div>
          ) : (
            players.slice(0, 8).map((player, index) => (
              <Card key={player.id} className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300 group">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs border-accent text-accent">
                      {getPlayerRank(index)}
                    </Badge>
                    <span className="text-lg">{player.country}</span>
                  </div>
                  <Avatar className="w-16 h-16 mx-auto mb-2 ring-2 ring-primary/30">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{player.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {player.games.length > 0 ? player.games[0] : 'FGC'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-2 rounded bg-muted/30">
                      <div className="font-bold text-accent">{player.tournaments}</div>
                      <div className="text-xs text-muted-foreground">Tournaments</div>
                    </div>
                    <div className="text-center p-2 rounded bg-muted/30">
                      <div className="font-bold text-secondary">{player.wins}</div>
                      <div className="text-xs text-muted-foreground">Wins</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-2 rounded bg-muted/30">
                      <div className="font-bold text-primary">{player.winRate}%</div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="text-center p-2 rounded bg-primary/10">
                      <div className="font-bold text-primary">{formatEarnings(player.totalEarnings)}</div>
                      <div className="text-xs text-muted-foreground">Estimated</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground mb-1">Recent Achievements</div>
                    {player.achievements.length === 0 ? (
                      <div className="text-xs text-muted-foreground">No achievements recorded</div>
                    ) : (
                      player.achievements.slice(0, 2).map((achievement, i) => (
                        <Badge key={i} variant="outline" className="text-xs mr-1 mb-1 block truncate">
                          <Trophy className="h-2 w-2 mr-1" />
                          {achievement}
                        </Badge>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default PlayerProfiles;