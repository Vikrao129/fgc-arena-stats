import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy } from "lucide-react";

const GameSection = () => {
  const games = [
    {
      name: "Street Fighter 6",
      logo: "🥊",
      recentTournaments: [
        { name: "Capcom Pro Tour 2024", date: "2024-01-15", players: 256, winner: "Daigo" },
        { name: "EVO 2024", date: "2024-01-10", players: 1024, winner: "Punk" },
        { name: "Red Bull Kumite", date: "2024-01-05", players: 128, winner: "MenaRD" }
      ]
    },
    {
      name: "Tekken 8",
      logo: "👊",
      recentTournaments: [
        { name: "Tekken World Tour", date: "2024-01-12", players: 512, winner: "JDCR" },
        { name: "King of Iron Fist", date: "2024-01-08", players: 256, winner: "Knee" },
        { name: "TWT Finals", date: "2024-01-03", players: 64, winner: "Arslan Ash" }
      ]
    }
  ];

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
                  {game.recentTournaments.map((tournament, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground">{tournament.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          {tournament.winner}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {tournament.date}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {tournament.players} players
                        </div>
                      </div>
                    </div>
                  ))}
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