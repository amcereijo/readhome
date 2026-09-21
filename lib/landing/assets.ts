import landingManifest from "../../public/landing/manifest.json" with { type: "json" };

export type LandingAssetType = "image" | "gif" | "video";

export type LandingAsset = {
  feature: string;
  route: string;
  viewport: { width: number; height: number };
  type: LandingAssetType;
  src: string;
  alt: string;
  locale?: "en" | "es";
};

export type LandingManifest = {
  generatedAt: string;
  assets: LandingAsset[];
};

const fallback: LandingManifest = { generatedAt: "", assets: [] };

function isManifest(value: unknown): value is LandingManifest {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LandingManifest>;
  return Array.isArray(candidate.assets);
}

export const landingManifestData: LandingManifest = isManifest(landingManifest)
  ? landingManifest
  : fallback;

export function getLandingAsset(feature: string): LandingAsset | undefined {
  return landingManifestData.assets.find((asset) => asset.feature === feature);
}

export function hasLandingAssets(): boolean {
  return landingManifestData.assets.length > 0;
}
