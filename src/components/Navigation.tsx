import { Button } from "@/components/ui/button";
import { Trophy, Users, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();
  
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">FGC Tracker</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/sf6-tournaments')}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Tournaments
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Users className="h-4 w-4 mr-2" />
              Players
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Games
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;