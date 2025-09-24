import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Target } from "lucide-react";

const PlayerProfiles = () => {
  const topPlayers = [
    {
      name: "Daigo Umehara",
      country: "🇯🇵",
      game: "Street Fighter 6",
      rank: "#1",
      tournaments: 12,
      wins: 8,
      earnings: "$125,000",
      achievements: ["EVO Champion", "Capcom Cup Winner", "CPT Champion"]
    },
    {
      name: "JDCR",
      country: "🇰🇷", 
      game: "Tekken 8",
      rank: "#1",
      tournaments: 15,
      wins: 11,
      earnings: "$98,500",
      achievements: ["TWT Champion", "EVO Champion", "King of Iron Fist"]
    },
    {
      name: "Punk",
      country: "🇺🇸",
      game: "Street Fighter 6", 
      rank: "#2",
      tournaments: 18,
      wins: 7,
      earnings: "$89,200",
      achievements: ["Red Bull Kumite", "CPT Premier", "Final Round"]
    },
    {
      name: "Knee",
      country: "🇰🇷",
      game: "Tekken 8",
      rank: "#2", 
      tournaments: 14,
      wins: 9,
      earnings: "$76,800",
      achievements: ["TWT Finals", "Combo Breaker", "CEO Champion"]
    }
  ];

  return (
    <section className="py-16 px-4 bg-muted/20">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Top Pro Players</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topPlayers.map((player, index) => (
            <Card key={index} className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300 group">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-xs border-accent text-accent">
                    {player.rank}
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
                  {player.game}
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
                
                <div className="text-center p-2 rounded bg-primary/10">
                  <div className="font-bold text-primary">{player.earnings}</div>
                  <div className="text-xs text-muted-foreground">Prize Money</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground mb-1">Recent Achievements</div>
                  {player.achievements.slice(0, 2).map((achievement, i) => (
                    <Badge key={i} variant="outline" className="text-xs mr-1 mb-1">
                      <Trophy className="h-2 w-2 mr-1" />
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlayerProfiles;