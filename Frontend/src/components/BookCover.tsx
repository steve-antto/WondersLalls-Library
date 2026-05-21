import React from 'react';

interface BookCoverProps {
  title: string;
  author: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
}

const colors = [
  'from-indigo-600 to-cyan-500',
  'from-pink-600 to-purple-600',
  'from-amber-500 to-rose-600',
  'from-emerald-600 to-teal-600',
  'from-blue-600 to-indigo-500',
  'from-purple-500 to-pink-500'
];

export default function BookCover({ title, author, image, size = 'md' }: BookCoverProps) {
  const getGradient = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  };

  const getInitials = (text: string) => {
    return text
      .split(' ')
      .map((word) => word[0])
      .slice(0, 3)
      .join('')
      .toUpperCase();
  };

  const dimensionClasses = {
    sm: 'h-32 w-20 text-xs',
    md: 'h-48 w-32 text-sm',
    lg: 'h-64 w-44 text-base'
  };

  if (image) {
    const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000'
      : '';
    const src = image.startsWith('http') ? image : `${backendUrl}/${image}`;

    return (
      <div className={`relative ${dimensionClasses[size]} rounded-md overflow-hidden shadow-lg border border-white/10 group transition-transform duration-350 hover:scale-105`}>
        <img
          src={src}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to gradient if image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  const gradient = getGradient(title);
  const initials = getInitials(title);

  return (
    <div className={`relative ${dimensionClasses[size]} rounded-md bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between shadow-xl border border-white/20 overflow-hidden group transition-transform duration-350 hover:scale-105`}>
      {/* Editorial Spine Shadow Overlay */}
      <div className="absolute top-0 left-0 bottom-0 w-[6px] bg-black/25 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Book Title Initials / Geometric Accent */}
      <div className="z-10 self-end text-white/40 font-serif font-black tracking-widest uppercase text-2xl">
        {initials}
      </div>

      {/* Book details */}
      <div className="z-10 flex flex-col gap-1">
        <h4 className="font-heading font-bold text-white leading-tight line-clamp-3 uppercase tracking-wide">
          {title}
        </h4>
        <span className="text-[10px] text-white/80 font-medium truncate font-sans">
          {author}
        </span>
      </div>
    </div>
  );
}
