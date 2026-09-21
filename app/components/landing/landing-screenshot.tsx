"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { LandingAsset } from "@/lib/landing/assets";

type Props = {
  asset: LandingAsset;
  priority?: boolean;
  className?: string;
};

function stillFallbackSrc(asset: LandingAsset): string {
  if (asset.type === "gif" || asset.type === "video") {
    return asset.src.replace(/\.(gif|webp|mp4)$/i, ".png");
  }
  return asset.src;
}

export function LandingScreenshot({ asset, priority = false, className }: Props) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const shouldAnimate = !reduceMotion && asset.type !== "image";
  const baseClass = className ?? "h-auto w-full rounded-xl border border-zinc-200 bg-white shadow-sm";

  if (asset.type === "video" && shouldAnimate) {
    return (
      <video
        src={asset.src}
        autoPlay
        muted
        loop
        playsInline
        preload={priority ? "auto" : "metadata"}
        aria-label={asset.alt}
        className={baseClass}
      />
    );
  }

  if (asset.type === "gif" && shouldAnimate) {
    // next/image does not preserve GIF animation; render as a plain <img>.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset.src}
        alt={asset.alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={baseClass}
      />
    );
  }

  return (
    <Image
      src={reduceMotion ? stillFallbackSrc(asset) : asset.src}
      alt={asset.alt}
      width={1280}
      height={800}
      priority={priority}
      unoptimized
      className={baseClass}
    />
  );
}
