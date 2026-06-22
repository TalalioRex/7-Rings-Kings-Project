import type { Payline } from "@/types/slot";

export const PAYLINES: Payline[] = [
  { id: "top", name: "Top Row", positions: [0, 0, 0, 0, 0] },
  { id: "middle", name: "Middle Row", positions: [1, 1, 1, 1, 1] },
  { id: "bottom", name: "Bottom Row", positions: [2, 2, 2, 2, 2] },
  { id: "v", name: "V Shape", positions: [0, 1, 2, 1, 0] },
  { id: "inverted-v", name: "Inverted V", positions: [2, 1, 0, 1, 2] },
  { id: "zigzag-1", name: "Zigzag 1", positions: [0, 1, 0, 1, 0] },
  { id: "zigzag-2", name: "Zigzag 2", positions: [2, 1, 2, 1, 2] },
  { id: "diagonal-down", name: "Diagonal Down", positions: [0, 0, 1, 2, 2] },
  { id: "diagonal-up", name: "Diagonal Up", positions: [2, 2, 1, 0, 0] },
  { id: "mixed-center", name: "Mixed Center", positions: [1, 0, 1, 2, 1] }
];
