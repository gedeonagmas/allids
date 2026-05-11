"use client";
import * as React from "react";
import world from "./worldmap.json";
import { VectorMap } from "@south-paw/react-vector-maps";
import { Button } from "@/components/ui/button";
import { Plus, Minus, MapPin } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const VMap = ({ height = 350 }: { height?: number }) => {
  const [zoom, setZoom] = React.useState(1);
  
  // Mock pointers
  const markers = [
    { id: 1, name: "New York, USA", top: "35%", left: "25%" },
    { id: 2, name: "London, UK", top: "30%", left: "48%" },
    { id: 3, name: "Tokyo, Japan", top: "40%", left: "85%" },
    { id: 4, name: "Sydney, Australia", top: "75%", left: "88%" },
  ];

  return (
    <div className="relative group overflow-hidden rounded-lg bg-default-50/50">
      <div 
        style={{ 
          height: `${height}px`,
          transform: `scale(${zoom})`,
          transition: "transform 0.3s ease-out",
          transformOrigin: "center center"
        }} 
        className="w-full relative"
      >
        <VectorMap
          {...world}
          className="h-full w-full object-cover dashcode-app-vmap"
        />
        
        {/* Markers */}
        <TooltipProvider>
          {markers.map((marker) => (
            <div 
              key={marker.id}
              className="absolute z-10"
              style={{ top: marker.top, left: marker.left }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                   <div className="cursor-pointer">
                      <div className="h-3 w-3 bg-primary rounded-full animate-ping absolute" />
                      <div className="h-3 w-3 bg-primary rounded-full relative border-2 border-white" />
                   </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-[10px] font-bold">{marker.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </TooltipProvider>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1 z-20">
        <Button 
          variant="outline" 
          size="icon" 
          className="w-8 h-8 bg-background/80" 
          onClick={() => setZoom(prev => Math.min(prev + 0.5, 3))}
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-8 h-8 bg-background/80" 
          onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))}
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default VMap;
