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
  onFavoriteChange?: (symbol: SymbolSearchMatch, isFavorited: boolean) => void
}

export function FavoriteButton({ 
  symbol, 
  size = 'default',
  showTooltip = true,
  className,
  onFavoriteChange
}: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  
  // Track favorite state locally to make updates feel instant
  const [isFavorited, setIsFavorited] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Update local state when favorites change in context
  useEffect(() => {
    const newState = isFavorite(symbol)
    setIsFavorited(newState)
  }, [isFavorite, symbol])

  // Handle toggling favorite status with optimistic UI update
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    // Get current and new state
    const currentState = isFavorited
    const newState = !currentState
    
    // Update local state immediately (optimistic UI)
    setIsFavorited(newState)
    setIsAnimating(true)
    
    // Notify parent component about the change if a callback was provided
    if (onFavoriteChange) {
      onFavoriteChange(symbol, newState)
    }
    
    // Update global state directly using the appropriate function
    if (newState) {
      // Adding to favorites
      addFavorite(symbol)
    } else {
      // Removing from favorites
      removeFavorite(symbol)
    }
    
    // Reset animation after a brief delay
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }, [isFavorited, onFavoriteChange, symbol, addFavorite, removeFavorite])

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