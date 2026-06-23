export type AssetCategory =
  | "logo"
  | "intro-image"
  | "intro-video"
  | "background"
  | "chapter-image"
  | "chapter-video"
  | "final-scene"
  | "character"
  | "main-character"
  | "slot-symbol"
  | "jackpot-symbol"
  | "wild-symbol"
  | "scatter-symbol"
  | "ui-decoration"
  | "reference"
  | "placeholder"
  | "future-story-asset"
  | "unused-needs-review";

export type AssetMediaType = "image" | "video" | "animation" | "reference" | "placeholder";

export type ProjectAsset = {
  id: string;
  displayName: string;
  sourceFolderName: string;
  sourcePath: string;
  publicPath?: string;
  assetPath?: string;
  category: AssetCategory;
  mediaType: AssetMediaType;
  recommendedUse: string;
  notes: string;
  fallbackColor?: string;
};

export const PROJECT_ASSETS: ProjectAsset[] = [
  {
    id: "official-logo-scene",
    displayName: "7 Rings 7 Kings Logo Scene",
    sourceFolderName: "Logo",
    sourcePath: "Logo/Logo with the Background.png",
    publicPath: "/assets/logo/logo-scene.png",
    assetPath: "/assets/logo/logo-scene.png",
    category: "logo",
    mediaType: "image",
    recommendedUse: "Primary mode-select and launcher logo.",
    notes: "Safe default selected from Logo folder after full rescan because transparent-style candidates contain visible checkerboard."
  },
  {
    id: "logo-stacked-full",
    displayName: "7 Rings 7 Kings Stacked Logo",
    sourceFolderName: "Logo",
    sourcePath: "Logo/Logo-Stacked-Full.png",
    publicPath: "/assets/logo/logo.png",
    assetPath: "/assets/logo/logo.png",
    category: "logo",
    mediaType: "image",
    recommendedUse: "Alternate logo candidate for manual design review.",
    notes: "Copied but not used as primary because the source image includes a checkerboard-looking backdrop."
  },
  {
    id: "official-logo-one-line",
    displayName: "7 Rings 7 Kings One-Line Logo",
    sourceFolderName: "Logo",
    sourcePath: "Logo/Logo-One Line-Full.png",
    publicPath: "/assets/logo/logo-one-line.png",
    assetPath: "/assets/logo/logo-one-line.png",
    category: "logo",
    mediaType: "image",
    recommendedUse: "Wide logo candidate for compact headers.",
    notes: "Copied as alternate official logo candidate."
  },
  {
    id: "intro-main-team",
    displayName: "Intro Team Image",
    sourceFolderName: "Intro/Images",
    sourcePath: "Intro/Images/Intro-1.png",
    publicPath: "/assets/intro/images/intro-01.png",
    assetPath: "/assets/intro/images/intro-01.png",
    category: "intro-image",
    mediaType: "image",
    recommendedUse: "Mode-select cinematic background and launcher ambience.",
    notes: "Readable team image, no gameplay behavior attached."
  },
  {
    id: "intro-alt-image",
    displayName: "Intro Alternate Image",
    sourceFolderName: "Intro/Images",
    sourcePath: "Intro/Images/Intro-2.png",
    publicPath: "/assets/intro/images/intro-02.png",
    assetPath: "/assets/intro/images/intro-02.png",
    category: "intro-image",
    mediaType: "image",
    recommendedUse: "Fallback mode-select background.",
    notes: "Alternate intro still for future manual design review."
  },
  {
    id: "intro-main-video",
    displayName: "Intro Logo Video",
    sourceFolderName: "Intro/Video",
    sourcePath: "Intro/Video/Intro-Logo.mp4",
    publicPath: "/assets/intro/videos/intro-logo.mp4",
    assetPath: "/assets/intro/videos/intro-logo.mp4",
    category: "intro-video",
    mediaType: "video",
    recommendedUse: "Primary muted looping mode-select background.",
    notes: "Requested launcher background video. It remains muted, looping, playsInline, and non-required for gameplay."
  },
  {
    id: "gameplay-background",
    displayName: "Gameplay Background",
    sourceFolderName: "Backgrounds",
    sourcePath: "Backgrounds/Background (1).png",
    publicPath: "/assets/backgrounds/gameplay-background.png",
    assetPath: "/assets/backgrounds/gameplay-background.png",
    category: "background",
    mediaType: "image",
    recommendedUse: "Dark gameplay stage background behind the slot cabinet.",
    notes: "Selected because it is atmospheric and remains readable under a dark overlay."
  },
  {
    id: "mode-background",
    displayName: "Mode Select Background",
    sourceFolderName: "Backgrounds",
    sourcePath: "Backgrounds/Background (2).png",
    publicPath: "/assets/backgrounds/mode-background.png",
    assetPath: "/assets/backgrounds/mode-background.png",
    category: "background",
    mediaType: "image",
    recommendedUse: "Fallback launcher background if intro image/video fails.",
    notes: "Copied as a non-video fallback."
  },
  {
    id: "chapter-01-scene-01a",
    displayName: "Chapter 1 Scene 1A",
    sourceFolderName: "Chapter 1/Imagery",
    sourcePath: "Chapter 1/Imagery/Scene 1A.png",
    publicPath: "/assets/chapters/chapter-01/scene-01a.png",
    assetPath: "/assets/chapters/chapter-01/scene-01a.png",
    category: "chapter-image",
    mediaType: "image",
    recommendedUse: "Aisle 7 Adventure locked teaser card.",
    notes: "Used as non-playable teaser imagery only."
  },
  {
    id: "adventure-teaser-scene",
    displayName: "Adventure Teaser Scene",
    sourceFolderName: "Chapter 1/Imagery",
    sourcePath: "Chapter 1/Imagery/Scene 1A.png",
    publicPath: "/assets/scenes/adventure-teaser.png",
    assetPath: "/assets/scenes/adventure-teaser.png",
    category: "future-story-asset",
    mediaType: "image",
    recommendedUse: "Locked Aisle 7 Adventure visual treatment.",
    notes: "No story progression or gameplay is implemented from this asset."
  },
  {
    id: "shrimpie-the-seventh",
    displayName: "Shrimpie the Seventh",
    sourceFolderName: "Slot Assets/Shrimpie the Seventh",
    sourcePath: "Slot Assets/Shrimpie the Seventh/Shrimpie the Seventh.png",
    publicPath: "/assets/jackpot/shrimpie-the-seventh/symbol.png",
    assetPath: "/assets/jackpot/shrimpie-the-seventh/symbol.png",
    category: "jackpot-symbol",
    mediaType: "image",
    recommendedUse: "Premium jackpot reel symbol, jackpot paytable entry, and jackpot celebration.",
    notes: "Confirmed as safe default jackpot symbol for Phase 1.7.",
    fallbackColor: "#ffd166"
  },
  {
    id: "chuck-vadar",
    displayName: "Chuck Vadar",
    sourceFolderName: "Slot Assets/Chuck Vadar",
    sourcePath: "Slot Assets/Chuck Vadar/Chuck Vadar.png",
    publicPath: "/assets/slot-symbols/chuck-vadar/symbol.png",
    assetPath: "/assets/slot-symbols/chuck-vadar/symbol.png",
    category: "wild-symbol",
    mediaType: "image",
    recommendedUse: "Wild reel symbol.",
    notes: "Wild substitutes for regular symbols only.",
    fallbackColor: "#ff2c4d"
  },
  {
    id: "lord-swizzlepop",
    displayName: "Lord Swizzlepop",
    sourceFolderName: "Slot Assets/Lord Swizzlepop",
    sourcePath: "Slot Assets/Lord Swizzlepop/Lord Swizzlepop.png",
    publicPath: "/assets/slot-symbols/lord-swizzlepop/symbol.png",
    assetPath: "/assets/slot-symbols/lord-swizzlepop/symbol.png",
    category: "slot-symbol",
    mediaType: "image",
    recommendedUse: "High-value regular reel symbol.",
    notes: "Selected from current Slot Assets folder.",
    fallbackColor: "#8d5cff"
  },
  {
    id: "sourcerer-sash",
    displayName: "Sourcerer Sash",
    sourceFolderName: "Slot Assets/Sourcerer Sash",
    sourcePath: "Slot Assets/Sourcerer Sash/Sourcerer Sash.png",
    publicPath: "/assets/slot-symbols/sourcerer-sash/symbol.png",
    assetPath: "/assets/slot-symbols/sourcerer-sash/symbol.png",
    category: "slot-symbol",
    mediaType: "image",
    recommendedUse: "High-value regular reel symbol.",
    notes: "Selected from current Slot Assets folder.",
    fallbackColor: "#0fe7c8"
  },
  {
    id: "grand-lolliwick",
    displayName: "Grand Lolliwick",
    sourceFolderName: "Slot Assets/Grand Lolliwick",
    sourcePath: "Slot Assets/Grand Lolliwick/Grand Lolliwick.png",
    publicPath: "/assets/slot-symbols/grand-lolliwick/symbol.png",
    assetPath: "/assets/slot-symbols/grand-lolliwick/symbol.png",
    category: "slot-symbol",
    mediaType: "image",
    recommendedUse: "Medium-value regular reel symbol.",
    notes: "Folder currently uses Grand Lolliwick spelling.",
    fallbackColor: "#ff5fc8"
  },
  {
    id: "marshal-mallow",
    displayName: "Marshal Mallow",
    sourceFolderName: "Slot Assets/Marshal Mallow",
    sourcePath: "Slot Assets/Marshal Mallow/Marshal Mallow.png",
    publicPath: "/assets/slot-symbols/marshal-mallow/symbol.png",
    assetPath: "/assets/slot-symbols/marshal-mallow/symbol.png",
    category: "slot-symbol",
    mediaType: "image",
    recommendedUse: "Medium-value regular reel symbol.",
    notes: "Selected from current Slot Assets folder.",
    fallbackColor: "#ffe3f6"
  },
  {
    id: "master-nigiri",
    displayName: "Master Nigiri",
    sourceFolderName: "Slot Assets/Master Nigiri",
    sourcePath: "Slot Assets/Master Nigiri/Master Nigiri.png",
    publicPath: "/assets/slot-symbols/master-nigiri/symbol.png",
    assetPath: "/assets/slot-symbols/master-nigiri/symbol.png",
    category: "slot-symbol",
    mediaType: "image",
    recommendedUse: "Medium-value regular reel symbol.",
    notes: "Selected from current Slot Assets folder.",
    fallbackColor: "#50b6ff"
  },
  {
    id: "blinky-bluewig",
    displayName: "Blinky Bluewig",
    sourceFolderName: "Slot Assets/Blinky Bluewig",
    sourcePath: "Slot Assets/Blinky Bluewig/Blinky Bluewig.png",
    publicPath: "/assets/slot-symbols/blinky-bluewig/symbol.png",
    assetPath: "/assets/slot-symbols/blinky-bluewig/symbol.png",
    category: "slot-symbol",
    mediaType: "image",
    recommendedUse: "Low-value regular reel symbol.",
    notes: "Selected from current Slot Assets folder.",
    fallbackColor: "#2d7cff"
  },
  {
    id: "ziggy-zestwig",
    displayName: "Ziggy Zestwig",
    sourceFolderName: "Slot Assets/Ziggy Zestwig",
    sourcePath: "Slot Assets/Ziggy Zestwig/Ziggy Zestwig.png",
    publicPath: "/assets/slot-symbols/ziggy-zestwig/symbol.png",
    assetPath: "/assets/slot-symbols/ziggy-zestwig/symbol.png",
    category: "slot-symbol",
    mediaType: "image",
    recommendedUse: "Low-value regular reel symbol.",
    notes: "Selected from current Slot Assets folder.",
    fallbackColor: "#f7ff4a"
  },
  {
    id: "aisle-7-scatter",
    displayName: "Aisle 7 Scatter",
    sourceFolderName: "No matching image folder found",
    sourcePath: "",
    category: "scatter-symbol",
    mediaType: "placeholder",
    recommendedUse: "Scatter tile placeholder rendered by canvas/CSS fallback.",
    notes: "No dedicated Aisle 7 Scatter image was found in the full recursive scan.",
    fallbackColor: "#13f2aa"
  },
  {
    id: "main-character-tala",
    displayName: "Tala",
    sourceFolderName: "Slot Assets/Main Characters",
    sourcePath: "Slot Assets/Main Characters/Tala.png",
    publicPath: "/assets/characters/tala.png",
    assetPath: "/assets/characters/tala.png",
    category: "main-character",
    mediaType: "image",
    recommendedUse: "Default right-side feature panel and mode-select character art.",
    notes: "Main characters are not used as reel symbols in Phase 1."
  },
  {
    id: "main-character-jason",
    displayName: "Jason",
    sourceFolderName: "Slot Assets/Main Characters",
    sourcePath: "Slot Assets/Main Characters/Jason.png",
    publicPath: "/assets/characters/jason.png",
    assetPath: "/assets/characters/jason.png",
    category: "main-character",
    mediaType: "image",
    recommendedUse: "Future UI feature panel or title/mode visual.",
    notes: "Not used as a reel symbol in Phase 1."
  },
  {
    id: "main-character-kaz",
    displayName: "Kaz",
    sourceFolderName: "Slot Assets/Main Characters",
    sourcePath: "Slot Assets/Main Characters/Kaz.png",
    publicPath: "/assets/characters/kaz.png",
    assetPath: "/assets/characters/kaz.png",
    category: "main-character",
    mediaType: "image",
    recommendedUse: "Future UI feature panel or title/mode visual.",
    notes: "Not used as a reel symbol in Phase 1."
  },
  {
    id: "main-character-marcus",
    displayName: "Marcus",
    sourceFolderName: "Slot Assets/Main Characters",
    sourcePath: "Slot Assets/Main Characters/Marcus.png",
    publicPath: "/assets/characters/marcus.png",
    assetPath: "/assets/characters/marcus.png",
    category: "main-character",
    mediaType: "image",
    recommendedUse: "Future UI feature panel or title/mode visual.",
    notes: "Not used as a reel symbol in Phase 1."
  },
  {
    id: "main-character-pascal",
    displayName: "Pascal",
    sourceFolderName: "Slot Assets/Main Characters",
    sourcePath: "Slot Assets/Main Characters/Pascal.png",
    publicPath: "/assets/characters/pascal.png",
    assetPath: "/assets/characters/pascal.png",
    category: "main-character",
    mediaType: "image",
    recommendedUse: "Future UI feature panel or title/mode visual.",
    notes: "Not used as a reel symbol in Phase 1."
  },
  {
    id: "main-character-pippa",
    displayName: "Pippa",
    sourceFolderName: "Slot Assets/Main Characters",
    sourcePath: "Slot Assets/Main Characters/Pippa.png",
    publicPath: "/assets/characters/pippa.png",
    assetPath: "/assets/characters/pippa.png",
    category: "main-character",
    mediaType: "image",
    recommendedUse: "Future UI feature panel or title/mode visual.",
    notes: "Not used as a reel symbol in Phase 1."
  }
];

export const shrimpieJackpotArt = [
  {
    id: "shrimpie-symbol",
    displayName: "Shrimpie the Seventh",
    assetPath: "/assets/jackpot/shrimpie-the-seventh/symbol.png",
    sourcePath: "Slot Assets/Shrimpie the Seventh/Shrimpie the Seventh.png"
  },
  {
    id: "shrimpie-pose-01",
    displayName: "Shrimpie the Seventh Pose 1",
    assetPath: "/assets/jackpot/shrimpie-the-seventh/pose-01.png",
    sourcePath: "Slot Assets/Shrimpie the Seventh/Shrimpie the Seventh - Pose (1).png"
  },
  {
    id: "shrimpie-pose-02",
    displayName: "Shrimpie the Seventh Pose 2",
    assetPath: "/assets/jackpot/shrimpie-the-seventh/pose-02.png",
    sourcePath: "Slot Assets/Shrimpie the Seventh/Shrimpie the Seventh - Pose (2).png"
  },
  {
    id: "shrimpie-pose-03",
    displayName: "Shrimpie the Seventh Pose 3",
    assetPath: "/assets/jackpot/shrimpie-the-seventh/pose-03.png",
    sourcePath: "Slot Assets/Shrimpie the Seventh/Shrimpie the Seventh - Pose (3).png"
  },
  {
    id: "shrimpie-pose-04",
    displayName: "Shrimpie the Seventh Pose 4",
    assetPath: "/assets/jackpot/shrimpie-the-seventh/pose-04.png",
    sourcePath: "Slot Assets/Shrimpie the Seventh/Shrimpie the Seventh - Pose (4).png"
  },
  {
    id: "shrimpie-pose-05",
    displayName: "Shrimpie the Seventh Pose 5",
    assetPath: "/assets/jackpot/shrimpie-the-seventh/pose-05.png",
    sourcePath: "Slot Assets/Shrimpie the Seventh/Shrimpie the Seventh - Pose (5).png"
  },
  {
    id: "shrimpie-pose-06",
    displayName: "Shrimpie the Seventh Pose 6",
    assetPath: "/assets/jackpot/shrimpie-the-seventh/pose-06.png",
    sourcePath: "Slot Assets/Shrimpie the Seventh/Shrimpie the Seventh - Pose (6).png"
  }
] as const;

export const SCANNED_ASSET_SUMMARY = [
  { sourceFolderName: "Backgrounds", category: "background", images: 8, videos: 0, recommendedUse: "Gameplay and launcher backgrounds." },
  { sourceFolderName: "Intro/Images", category: "intro-image", images: 5, videos: 0, recommendedUse: "Launcher and title ambience." },
  { sourceFolderName: "Intro/Video", category: "intro-video", images: 0, videos: 6, recommendedUse: "Muted optional launcher ambience only." },
  { sourceFolderName: "Logo", category: "logo", images: 5, videos: 1, recommendedUse: "Official logo candidates." },
  { sourceFolderName: "Chapter 1-8/Imagery", category: "future-story-asset", images: 47, videos: 0, recommendedUse: "Locked teaser/reference assets only in Phase 1." },
  { sourceFolderName: "Chapter 1-8/Video", category: "future-story-asset", images: 0, videos: 47, recommendedUse: "Do not use as gameplay in Phase 1." },
  { sourceFolderName: "Slot Assets", category: "slot-symbol", images: 57, videos: 0, recommendedUse: "Creature symbols, main characters, Wild, and Jackpot art." }
] as const;

export function getAssetById(assetId: string): ProjectAsset | undefined {
  return PROJECT_ASSETS.find((asset) => asset.id === assetId);
}
