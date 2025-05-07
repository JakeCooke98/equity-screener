import { CSSProperties } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePlaceholderProps {
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  iconSize?: number;
}

/**
 * Image placeholder component for use when actual images are not available
 * Safer alternative to external placeholder services
 */
export function ImagePlaceholder({
  width = 600,
  height = 400,
  className,
  style,
  iconSize = 48
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted rounded-md overflow-hidden",
        className
      )}
      style={{
        width: width,
        height: height,
        ...style
      }}
    >
      <ImageIcon 
        size={iconSize}
        className="text-muted-foreground/50"
      />
    </div>
  );
} 