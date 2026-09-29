import React from "react";

export type MediaKind = "event" | "announcement";

interface Props {
  src?: string;
  alt: string;
  kind: MediaKind;
  height?: number;
  className?: string;
}

const EMOJI: Record<MediaKind, string> = {
  event: "🗓️",
  announcement: "📣"
};

/**
 * Every event and announcement picture goes through here. Items without a
 * picture show the branded gradient placeholder instead of a broken image,
 * so cards keep a uniform shape whether or not the admin attached a photo.
 */
export default function ItemImage({ src, alt, kind, height = 160, className }: Props) {
  const style: React.CSSProperties = { height };

  if (src) {
    return (
      <div className={`media ${className || ""}`} style={style}>
        <img src={src} alt={alt} loading="lazy" />
      </div>
    );
  }

  return (
    <div className={`media media--placeholder ${className || ""}`} style={style} role="img" aria-label={`${kind} placeholder`}>
      <span aria-hidden="true">{EMOJI[kind]}</span>
      <small>{kind === "event" ? "Event" : "Announcement"}</small>
    </div>
  );
}
