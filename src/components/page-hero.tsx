import React from 'react';
import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';

interface PageHeroProps {
  title: string;
  description?: string;
  badge?: {
    icon: React.ReactNode;
    label: string;
  };
  showBreadcrumb?: boolean;
}

export function PageHero({ title, description, badge, showBreadcrumb }: PageHeroProps) {
  return (
    <section className="bg-background border-b border-border py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 text-center flex flex-col items-center">
        {showBreadcrumb && (
          <nav className="flex items-center text-[10px] md:text-xs font-bold tracking-widest uppercase text-muted-foreground mb-6 space-x-1 md:space-x-2">
            <Link href="/" className="hover:text-primary transition-colors flex items-center">
              <Home className="w-3 h-3 mr-1" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary truncate max-w-[150px] sm:max-w-none">{title}</span>
          </nav>
        )}
        {badge && (
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 text-primary px-4 py-2 text-xs font-semibold tracking-[0.22em] uppercase">
            {badge.icon}
            {badge.label}
          </div>
        )}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-6 text-foreground">{title}</h1>
        {description && (
          <p className="max-w-2xl mx-auto mt-4 text-muted-foreground text-base sm:text-lg px-4">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
