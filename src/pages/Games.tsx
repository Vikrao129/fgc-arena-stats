import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Games = () => {
  const navigate = useNavigate();

  const games = [
    {
      title: "Street Fighter 6",
      description: "Browse upcoming and past Street Fighter 6 tournaments",
      route: "/sf6-tournaments",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop"
    },
    {
      title: "Tekken 8",
      description: "Browse upcoming and past Tekken 8 tournaments",
      route: "/tekken8-tournaments",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Fighting Games</h1>
          <p className="text-muted-foreground mb-8">
            Explore tournament data and player statistics for your favorite fighting games
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {games.map((game) => (
              <Card key={game.title} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img 
                    src={game.image} 
                    alt={game.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{game.title}</CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate(game.route)}
                    className="w-full"
                  >
                    View Tournaments
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Games;
