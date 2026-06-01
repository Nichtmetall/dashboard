import { Images } from "lucide-react";

import { buildPhotoUrl, getRecentPhotos } from "@/lib/google/photos";
import type { PhotoItem } from "@/lib/google/types";
import { formatDate } from "@/lib/format";
import {
  WidgetEmpty,
  WidgetError,
  WidgetShell,
} from "@/components/dashboard/widget-shell";

export async function PhotosWidget({ userId }: { userId: string }) {
  const result = await getRecentPhotos(userId, 5);

  return (
    <WidgetShell title="Photos" icon={Images} className="lg:col-span-2">
      {!result.ok ? (
        <WidgetError message={result.error} />
      ) : result.data.length === 0 ? (
        <WidgetEmpty message="No photos found in your library." />
      ) : (
        <PhotoGallery photos={result.data} />
      )}
    </WidgetShell>
  );
}

function PhotoGallery({ photos }: { photos: PhotoItem[] }) {
  const [memory, ...rest] = photos;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <a
        href={memory.productUrl ?? "#"}
        target="_blank"
        rel="noreferrer"
        className="group relative block overflow-hidden rounded-lg border"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={buildPhotoUrl(memory.baseUrl, { width: 600, height: 600 })}
          alt={memory.description ?? memory.filename ?? "Memory of the day"}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-xs font-medium text-white">Memory of the day</p>
          {memory.creationTime ? (
            <p className="text-[10px] text-white/80">
              {formatDate(memory.creationTime)}
            </p>
          ) : null}
        </div>
      </a>

      <div className="grid grid-cols-2 gap-2">
        {rest.map((photo) => (
          <a
            key={photo.id}
            href={photo.productUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-md border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={buildPhotoUrl(photo.baseUrl, { width: 200, height: 200 })}
              alt={photo.description ?? photo.filename ?? "Photo"}
              className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
