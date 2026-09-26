import React from 'react';
import { Skeleton } from './ui/skeleton';

// --- Page-level skeleton for route lazy loading (App.jsx Suspense fallback) ---
export const PageSkeleton = () => (
  <div className="min-h-screen bg-off-white font-display">
    {/* Header skeleton */}
    <div className="sticky top-0 z-50 w-full border-b border-deep-green/10 bg-white">
      <div className="px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between max-w-[1440px] mx-auto">
        <Skeleton className="w-13 h-13 rounded-xl" />
        <div className="hidden md:flex items-center gap-4">
          <Skeleton className="w-32 h-9 rounded-lg" />
          <Skeleton className="w-20 h-9 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-20 h-9 rounded-lg" />
          <Skeleton className="w-28 h-9 rounded-lg" />
        </div>
      </div>
    </div>
    {/* Body skeleton */}
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
);

// --- University card skeleton for CollegeSearch ---
export const UniversityCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden flex flex-col h-full">
    {/* Header */}
    <div className="p-6 pb-4 bg-[#00674F] rounded-t-2xl">
      <div className="flex gap-4">
        <Skeleton className="size-12 rounded-lg bg-white/20" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 bg-white/20" />
          <Skeleton className="h-3 w-1/2 bg-white/15" />
        </div>
      </div>
    </div>
    {/* Course info */}
    <div className="px-6 pt-4 pb-3 space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-3/4" />
    </div>
    {/* Tags */}
    <div className="px-6 pb-4 flex gap-2">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
    {/* Info rows */}
    <div className="px-6 border-t border-gray-100">
      <div className="py-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
    {/* Requirements box */}
    <div className="mx-6 my-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-6 w-24 rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
    {/* Intakes */}
    <div className="px-6 py-4 border-t border-gray-100">
      <Skeleton className="h-2.5 w-28 mb-3" />
      <div className="flex gap-3">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
    {/* Action buttons */}
    <div className="px-6 py-5 flex gap-3 items-center mt-auto border-t border-gray-100">
      <Skeleton className="flex-1 h-11 rounded-xl" />
      <Skeleton className="w-11 h-11 rounded-xl" />
    </div>
  </div>
);

// --- Grid of university card skeletons ---
export const UniversityGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <UniversityCardSkeleton key={i} />
    ))}
  </div>
);

// --- Application card skeleton for MyApplications ---
export const ApplicationCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-deep-green/10 shadow-sm overflow-hidden">
    <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-36" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

// --- Applications page skeleton ---
export const ApplicationsPageSkeleton = () => (
  <div className="min-h-screen bg-off-white font-display p-8">
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>
      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-lg" />
        ))}
      </div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 gap-4">
        {[...Array(4)].map((_, i) => (
          <ApplicationCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

// --- Inline loader skeleton for infinite scroll ---
export const InfiniteScrollSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
    {[...Array(3)].map((_, i) => (
      <UniversityCardSkeleton key={i} />
    ))}
  </div>
);

// --- Profile page skeleton ---
export const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
    <div className="max-w-5xl mx-auto space-y-8">
      <Skeleton className="h-10 w-56" />
      <div className="bg-white rounded-2xl p-8 space-y-6">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-8 space-y-6">
        <Skeleton className="h-6 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- Admin table skeleton (for AdminApplications, AdminStudentList) ---
export const AdminTableSkeleton = ({ rows = 6 }) => (
  <div className="min-h-screen bg-deep-green font-display p-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-3">
          <Skeleton className="h-6 w-36 bg-white/10" />
          <Skeleton className="h-9 w-52 bg-white/15" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-xl bg-white/10" />
          <Skeleton className="h-10 w-32 rounded-xl bg-white/10" />
        </div>
      </div>
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-deep-green/10">
        {/* Table header */}
        <div className="bg-deep-green/5 px-6 py-4 flex gap-6">
          {[120, 160, 100, 80, 140].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
        {/* Table rows */}
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-6 py-5 flex items-center gap-6 border-b border-deep-green/5">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <div className="flex gap-1">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Admin universities list skeleton ---
export const AdminUniversitiesListSkeleton = () => (
  <div className="min-h-screen bg-deep-green font-display p-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-3">
          <Skeleton className="h-6 w-36 bg-white/10" />
          <Skeleton className="h-9 w-56 bg-white/15" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-xl bg-white/10" />
          <Skeleton className="h-10 w-36 rounded-xl bg-white/10" />
        </div>
      </div>
      {/* Filter bar */}
      <div className="bg-white/5 rounded-2xl p-6 mb-8 flex flex-wrap gap-4 items-end">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 min-w-[180px] space-y-2">
            <Skeleton className="h-3 w-20 bg-white/10" />
            <Skeleton className="h-10 w-full rounded-xl bg-white/10" />
          </div>
        ))}
        <Skeleton className="h-10 w-28 rounded-xl bg-white/10" />
      </div>
      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-deep-green/10 overflow-hidden">
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-5 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-deep-green/5 flex gap-2">
              <Skeleton className="flex-1 h-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Admin manage global skeleton ---
export const AdminManageSkeleton = () => (
  <div className="min-h-screen bg-deep-green font-display p-8">
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-3">
          <Skeleton className="h-6 w-36 bg-white/10" />
          <Skeleton className="h-9 w-48 bg-white/15" />
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-10 w-32 rounded-lg bg-white/10" />
        <Skeleton className="h-10 w-32 rounded-lg bg-white/10" />
      </div>
      {/* List items */}
      <div className="bg-white rounded-2xl border border-deep-green/10 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="px-6 py-5 flex items-center justify-between border-b border-deep-green/5">
            <div className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
