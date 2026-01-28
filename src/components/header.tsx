import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Header() {
  const logoImage = PlaceHolderImages.find(img => img.id === 'logo');

  return (
    <header className="py-4 px-4 md:px-8 border-b border-border/50 bg-card/50 backdrop-blur-lg sticky top-0 z-10">
      <div className="container mx-auto flex items-center gap-3">
        {logoImage && (
          <Image
            src={logoImage.imageUrl}
            alt={logoImage.description}
            width={40}
            height={40}
            className="rounded-full"
            data-ai-hint={logoImage.imageHint}
          />
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
          SkinVision AI
        </h1>
      </div>
    </header>
  );
}
