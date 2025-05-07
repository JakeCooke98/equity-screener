import { NewsArticle } from '@/services/alphaVantage/index'
import { ExternalLink } from 'lucide-react'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'
import Image from 'next/image'

interface StockNewsSectionProps {
  news: NewsArticle[]
  formatDate: (date: string) => string
}

// Make this interface available for import
export type { StockNewsSectionProps };

export function StockNewsSection({ news, formatDate }: StockNewsSectionProps) {
  return (
    <div className="space-y-5">
      {news.map((article, index) => (
        <a
          key={index}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="flex flex-col space-y-2 cursor-pointer hover:bg-muted/50 rounded-md p-2 -mx-2 transition-colors">
            {/* Title and source */}
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-60 mt-1" />
            </div>
            
            {/* Source and date */}
            <div className="text-xs text-muted-foreground">
              {article.source} · {formatDate(article.publishedAt)}
            </div>
            
            {/* Summary */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {article.summary}
            </p>
            
            {/* Image if available */}
            {article.image ? (
              <div className="relative w-full h-32 rounded-md overflow-hidden mt-2">
                {article.image.startsWith('http') ? (
                  // Try to load actual image if URL is provided
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform group-hover:scale-105"
                    // Fallback to placeholder on error
                    onError={(e) => {
                      // Replace with placeholder on error
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.classList.add('bg-muted', 'flex', 'items-center', 'justify-center');
                        const icon = document.createElement('div');
                        parent.appendChild(icon);
                      }
                    }}
                  />
                ) : (
                  // Use placeholder directly if no valid URL
                  <ImagePlaceholder 
                    style={{ width: '100%', height: '100%' }} 
                    iconSize={32}
                  />
                )}
              </div>
            ) : null}
          </div>
        </a>
      ))}
      
      {news.length === 0 && (
        <p className="text-muted-foreground text-sm">No recent news articles found.</p>
      )}
    </div>
  )
} 