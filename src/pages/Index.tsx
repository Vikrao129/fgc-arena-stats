import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import GameSection from "@/components/GameSection";
import PlayerProfiles from "@/components/PlayerProfiles";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <GameSection />
        <PlayerProfiles />
      </main>
      
      <footer className="border-t border-border bg-card/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 FGC Tracker. Built for the Fighting Game Community.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
