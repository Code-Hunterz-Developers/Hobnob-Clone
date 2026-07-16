import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  priority?: 'storefront' | 'admin';
};

export function BrandLogo({
  className,
  imageClassName,
  priority = 'storefront',
}: BrandLogoProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <img
        src="/images/lavashak-logo.png"
        alt="Lavashak Karachi"
        className={cn(
          'w-auto object-contain drop-shadow-[0_10px_24px_rgba(83,20,24,0.18)]',
          priority === 'admin' ? 'h-20 sm:h-24' : 'h-14 sm:h-16',
          imageClassName,
        )}
      />
    </div>
  );
}
