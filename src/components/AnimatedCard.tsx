
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: boolean;
  glowOnHover?: boolean;
}

const AnimatedCard = ({ 
  children, 
  className = "",
  hoverScale = true,
  glowOnHover = false
}: AnimatedCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={cn(
        "transition-all duration-300 cursor-pointer",
        hoverScale && "hover:scale-102",
        glowOnHover && isHovered && "shadow-xl shadow-purple-500/25",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </Card>
  );
};

export default AnimatedCard;
