import { Play, FolderGit2, Palette, Film, Share2 } from 'lucide-react';

export function PortfolioSkeleton() {
  return (
    <div id="portfolio-skeleton-loader" className="w-full animate-in fade-in duration-300">
      {/* Hero Section Skeleton */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 border-b border-[#EFE8DF] overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8 md:gap-10 mb-8">
            {/* Avatar Skeleton */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-tr from-[#D96C51]/30 via-[#F4CBAF]/30 to-[#EFE8DF]">
                <div className="w-full h-full rounded-full shimmer-skeleton" />
              </div>
            </div>

            {/* Header Text Skeletons */}
            <div className="flex-1 space-y-4 w-full">
              {/* Name Bar */}
              <div className="h-10 sm:h-12 md:h-14 w-3/4 max-w-md rounded-2xl shimmer-skeleton" />
              {/* Tagline Bar */}
              <div className="h-5 sm:h-6 w-1/2 max-w-sm rounded-xl shimmer-skeleton" />
              
              {/* Badge Pills Skeleton */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <div className="h-7 w-28 rounded-full shimmer-skeleton" />
                <div className="h-7 w-36 rounded-full shimmer-skeleton" />
              </div>

              {/* CTA Button Skeleton */}
              <div className="pt-2">
                <div className="h-11 w-36 rounded-xl shimmer-skeleton" />
              </div>
            </div>
          </div>

          {/* Stats Bar Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-[#EFE8DF] shadow-2xs space-y-2">
                <div className="h-6 w-24 rounded-lg shimmer-skeleton" />
                <div className="h-3.5 w-3/4 rounded-md shimmer-skeleton opacity-70" />
              </div>
            ))}
          </div>

          {/* Bio & Skills Cards Skeleton */}
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl visitor-card space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded shimmer-skeleton" />
                <div className="h-3 w-28 rounded shimmer-skeleton" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-4 w-full rounded shimmer-skeleton" />
                <div className="h-4 w-11/12 rounded shimmer-skeleton" />
                <div className="h-4 w-4/5 rounded shimmer-skeleton" />
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl visitor-card space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded shimmer-skeleton" />
                <div className="h-3 w-32 rounded shimmer-skeleton" />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {[18, 24, 20, 28, 22, 16, 26].map((w, idx) => (
                  <div 
                    key={idx} 
                    className="h-8 rounded-xl shimmer-skeleton" 
                    style={{ width: `${w * 4}px` }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects YouTube-style Skeleton */}
      <section className="py-20 sm:py-24 border-t border-[#EFE8DF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-3.5 h-3.5 text-[#D96C51]/50" />
                <div className="h-3 w-36 rounded shimmer-skeleton" />
              </div>
              <div className="h-9 w-52 rounded-xl shimmer-skeleton" />
            </div>
            <div className="h-7 w-24 rounded-full shimmer-skeleton" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl visitor-card overflow-hidden flex flex-col">
                <div className="h-1 w-full bg-[#EFE8DF]" />
                {/* 16:9 Thumbnail Skeleton */}
                <div className="aspect-video w-full shimmer-skeleton relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FolderGit2 className="w-8 h-8 text-[#D96C51]/20 animate-pulse" />
                  </div>
                </div>
                {/* Card Content Skeleton */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="h-3.5 w-24 rounded shimmer-skeleton" />
                    <div className="h-7 w-3/4 rounded-lg shimmer-skeleton" />
                    <div className="space-y-2 pt-1">
                      <div className="h-4 w-full rounded shimmer-skeleton" />
                      <div className="h-4 w-5/6 rounded shimmer-skeleton" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-10 w-32 rounded-xl shimmer-skeleton" />
                    <div className="h-10 w-28 rounded-xl shimmer-skeleton" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Graphic Designs Skeleton */}
      <section className="py-20 sm:py-24 border-t border-[#EFE8DF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-[#D96C51]/50" />
                <div className="h-3 w-40 rounded shimmer-skeleton" />
              </div>
              <div className="h-9 w-64 rounded-xl shimmer-skeleton" />
            </div>
            <div className="h-7 w-28 rounded-full shimmer-skeleton" />
          </div>

          {/* Filter Pills Skeleton */}
          <div className="flex items-center gap-2 pb-3 mb-8">
            <div className="h-8 w-16 rounded-full shimmer-skeleton" />
            <div className="h-8 w-24 rounded-full shimmer-skeleton" />
            <div className="h-8 w-28 rounded-full shimmer-skeleton" />
            <div className="h-8 w-20 rounded-full shimmer-skeleton" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl visitor-card overflow-hidden flex flex-col">
                <div className="h-1 w-full bg-[#EFE8DF]" />
                {/* 4:3 Image Skeleton */}
                <div className="aspect-[4/3] w-full shimmer-skeleton relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Palette className="w-8 h-8 text-[#D96C51]/20 animate-pulse" />
                  </div>
                  <div className="absolute top-3 left-3 w-20 h-5 rounded-full bg-white/60" />
                </div>
                {/* Details */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-20 rounded shimmer-skeleton" />
                    <div className="h-4 w-16 rounded-md shimmer-skeleton" />
                  </div>
                  <div className="h-6 w-3/4 rounded-lg shimmer-skeleton" />
                  <div className="h-3.5 w-full rounded shimmer-skeleton" />
                  <div className="pt-2 flex items-center justify-between">
                    <div className="h-4 w-24 rounded shimmer-skeleton" />
                    <div className="h-7 w-16 rounded-xl shimmer-skeleton" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Videos Section YouTube-style Video Skeleton Grid */}
      <section className="py-20 sm:py-24 border-t border-[#EFE8DF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-[#D96C51]/50" />
                <div className="h-3 w-40 rounded shimmer-skeleton" />
              </div>
              <div className="h-9 w-48 rounded-xl shimmer-skeleton" />
            </div>
            <div className="h-7 w-20 rounded-full shimmer-skeleton" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl visitor-card overflow-hidden">
                <div className="h-1 w-full bg-[#EFE8DF]" />
                {/* YouTube 16:9 Thumbnail Skeleton */}
                <div className="aspect-video w-full shimmer-skeleton relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#D96C51]/20 flex items-center justify-center">
                    <Play className="w-5 h-5 fill-current text-[#D96C51]/40 ml-0.5" />
                  </div>
                </div>
                {/* Video Info Skeleton */}
                <div className="p-5 sm:p-6 space-y-2">
                  <div className="h-3 w-20 rounded shimmer-skeleton" />
                  <div className="h-5 w-4/5 rounded shimmer-skeleton" />
                  <div className="h-4 w-3/5 rounded shimmer-skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Socials & Resume Skeletons */}
      <section className="py-16 border-t border-[#EFE8DF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-[#D96C51]/50" />
              <div className="h-3 w-32 rounded shimmer-skeleton" />
            </div>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-32 sm:w-36 rounded-2xl shimmer-skeleton" />
              ))}
            </div>
          </div>

          {/* Resume Banner Skeleton */}
          <div className="p-8 rounded-2xl visitor-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-md w-full">
              <div className="h-3 w-28 rounded shimmer-skeleton" />
              <div className="h-7 w-3/4 rounded-lg shimmer-skeleton" />
              <div className="h-4 w-full rounded shimmer-skeleton" />
            </div>
            <div className="h-12 w-48 rounded-xl shimmer-skeleton shrink-0" />
          </div>
        </div>
      </section>
    </div>
  );
}
