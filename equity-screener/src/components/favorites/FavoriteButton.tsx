'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { useFavorites } from '@/contexts/FavoritesContext'
import { SymbolSearchMatch } from '@/services/alphaVantage'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface FavoriteButtonProps {
  symbol: SymbolSearchMatch
  size?: 'sm' | 'default' | 'lg'
  showTooltip?: boolean
  className?: string
}

export function FavoriteButton({ 
  symbol, 
  size = 'default',
  showTooltip = true,
  className
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  
  // Track favorite state locally to make updates feel instant
  const [isFavorited, setIsFavorited] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Update local state when favorites change in context
  useEffect(() => {
    setIsFavorited(isFavorite(symbol))
  }, [isFavorite, symbol])

  // Handle toggling favorite status
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    // Update local state immediately (optimistic UI)
    setIsFavorited(!isFavorited)
    setIsAnimating(true)
    
    // Update global state
    toggleFavorite(symbol)
    
    // Reset animation after a brief delay
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }, [isFavorited, symbol, toggleFavorite])

  const button = (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        "p-0 h-auto hover:bg-transparent",
        isFavorited ? "text-yellow-400" : "text-muted-foreground",
        isAnimating && (isFavorited ? "animate-pulse" : "animate-bounce"),
        className
      )}
      onClick={handleClick}
    >
      <Star 
        className={cn(
          "transition-all duration-200",
          size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5',
          isFavorited ? 'fill-yellow-400' : 'fill-none'
        )} 
      />
    </Button>
  )

  if (!showTooltip) {
    return button
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          {isFavorited ? 'Remove from watchlist' : 'Add to watchlist'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 