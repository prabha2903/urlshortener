import React from 'react';

/**
 * Shimmer skeleton loading placeholder
 */
export function Skeleton({ className = '' }) {
  return (
    <div className={`skeleton rounded-lg bg-surface-3 ${className}`} />
  );
}

/**
 * URL card skeleton
 */
export function UrlCardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg ml-auto" />
      </div>
    </div>
  );
}

/**
 * Stats card skeleton
 */
export function StatsCardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-white/[0.04]">
          {Array.from({ length: 5 }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton className={`h-3 ${j === 0 ? 'w-24' : j === 1 ? 'w-48' : j === 2 ? 'w-16' : 'w-12'}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}