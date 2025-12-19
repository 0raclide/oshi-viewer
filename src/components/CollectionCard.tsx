'use client';

import Link from 'next/link';
import { ChevronRightIcon } from './icons';

interface CollectionCardProps {
  id: string;
  nameJa: string;
  nameEn: string;
  totalVolumes: number;
  totalItems: number;
  volumesWithTranslations: number;
}

export function CollectionCard({
  id,
  nameJa,
  nameEn,
  totalVolumes,
  totalItems,
  volumesWithTranslations,
}: CollectionCardProps) {
  return (
    <Link
      href={`/collection/${id}`}
      className="block elegant-card p-7 lg:p-8 card-hover group"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <h3 className="text-xl lg:text-2xl font-medium text-[var(--text-primary)] tracking-tight">
            <span className="text-[var(--text-accent)] font-jp text-2xl lg:text-3xl">{nameJa}</span>
          </h3>
          <p className="text-base text-[var(--text-secondary)]">
            {nameEn}
          </p>
          <div className="flex items-center gap-4 pt-2">
            <span className="badge badge-muted">
              {totalVolumes} volumes
            </span>
            <span className="badge badge-muted">
              {totalItems.toLocaleString()} items
            </span>
            {volumesWithTranslations > 0 && (
              <span className="badge badge-gold">
                {volumesWithTranslations} translated
              </span>
            )}
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center group-hover:bg-[var(--accent)] transition-colors">
          <ChevronRightIcon className="w-5 h-5 text-[var(--text-muted)] group-hover:text-black transition-colors" />
        </div>
      </div>
    </Link>
  );
}
