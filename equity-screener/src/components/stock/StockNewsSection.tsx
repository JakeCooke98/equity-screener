import { NewsArticle } from "@/services/alphaVantage";
import { ExternalLink } from "lucide-react";

interface StockNewsSectionProps {
  news: NewsArticle[];
  formatDate: (date: Date) => string;
}

export default function StockNewsSection({ news, formatDate }: StockNewsSectionProps) {
  return (
    <div className="space-y-6">
      {news.map((article, i) => (
        <div key={i} className="space-y-2">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium hover:underline flex items-start gap-1"
          >
            {article.title}
            <ExternalLink className="h-3 w-3 flex-shrink-0 mt-1" />
          </a>
          <div className="text-sm text-muted-foreground">
            {article.source} · {formatDate(new Date(article.publishedAt))}
          </div>
          <p className="text-sm">{article.summary}</p>
        </div>
      ))}
    </div>
  );
} 