import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Fighting Game
            <br />
            Tournament Tracker
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track tournament results, player rankings, and achievements across Street Fighter 6, Tekken 8, and more fighting games.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all">
              <Trophy className="h-5 w-5 mr-2" />
              View Tournaments
            </Button>
            <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent/10">
              <TrendingUp className="h-5 w-5 mr-2" />
              Player Rankings
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;