import {
  DeliveryOption,
  MugDesign,
  MugProduct,
  MugSize,
} from "./types";

export const mugSizes: MugSize[] = [
  { id: "small", label: "Small", capacityOz: 8, priceDelta: 0 },
  { id: "medium", label: "Medium", capacityOz: 12, priceDelta: 4 },
  { id: "large", label: "Large", capacityOz: 16, priceDelta: 8 },
];

export const mugDesigns: MugDesign[] = [
  {
    id: "sunrise-stripe",
    name: "Sunrise Stripe",
    accentColor: "#F59E0B",
    text: "SUN",
    priceDelta: 0,
  },
  {
    id: "forest-note",
    name: "Forest Note",
    accentColor: "#2F855A",
    text: "GROW",
    priceDelta: 2,
  },
  {
    id: "atelier-grid",
    name: "Atelier Grid",
    accentColor: "#1D4ED8",
    text: "GRID",
    priceDelta: 3,
  },
  {
    id: "berry-bloom",
    name: "Berry Bloom",
    accentColor: "#BE185D",
    text: "BLOOM",
    priceDelta: 4,
  },
  {
    id: "midnight-dot",
    name: "Midnight Dot",
    accentColor: "#111827",
    text: "MOON",
    priceDelta: 3,
  },
  {
    id: "forest-canopy",
    name: "Forest Canopy",
    accentColor: "#166534",
    text: "FOREST",
    priceDelta: 3,
  },
  {
    id: "desert-dunes",
    name: "Desert Dunes",
    accentColor: "#B45309",
    text: "DESERT",
    priceDelta: 3,
  },
  {
    id: "sea-current",
    name: "Sea Current",
    accentColor: "#0369A1",
    text: "SEA",
    priceDelta: 3,
  },
  {
    id: "mountain-ridge",
    name: "Mountain Ridge",
    accentColor: "#334155",
    text: "RIDGE",
    priceDelta: 3,
  },
  {
    id: "fox-trail",
    name: "Fox Trail",
    accentColor: "#C2410C",
    text: "FOX",
    priceDelta: 4,
  },
  {
    id: "owl-watch",
    name: "Owl Watch",
    accentColor: "#6B4F3A",
    text: "OWL",
    priceDelta: 4,
  },
  {
    id: "whale-song",
    name: "Whale Song",
    accentColor: "#1E40AF",
    text: "WHALE",
    priceDelta: 4,
  },
];

export const deliveryOptions: DeliveryOption[] = [
  {
    id: "standard",
    label: "Standard delivery",
    eta: "3-5 working days",
    price: 4,
  },
  {
    id: "express",
    label: "Quick delivery",
    eta: "2 working days",
    price: 9,
  },
];

export const mugProducts: MugProduct[] = [
  {
    id: "nordic-dawn",
    name: "Nordic Dawn Mug",
    description:
      "Stoneware mug with a soft matte finish for calm morning coffee rituals.",
    material: "Stoneware",
    finish: "Matte",
    basePrice: 18,
    tags: ["matte", "minimal", "breakfast"],
    palette: {
      body: "#F3EDE2",
      rim: "#D6B37A",
      handle: "#D6B37A",
      surface: "#FFFDF9",
    },
  },
  {
    id: "studio-ink",
    name: "Studio Ink Mug",
    description:
      "Gloss glazed mug with a darker profile suited to office or espresso setups.",
    material: "Ceramic",
    finish: "Gloss",
    basePrice: 20,
    tags: ["gloss", "office", "espresso"],
    palette: {
      body: "#1F2937",
      rim: "#111827",
      handle: "#111827",
      surface: "#F9FAFB",
    },
  },
  {
    id: "cafe-cloud",
    name: "Cafe Cloud Mug",
    description:
      "Rounded porcelain mug designed for latte art, gifting, and custom prints.",
    material: "Porcelain",
    finish: "Satin",
    basePrice: 22,
    tags: ["gift", "latte", "porcelain"],
    palette: {
      body: "#E0F2FE",
      rim: "#93C5FD",
      handle: "#93C5FD",
      surface: "#FFFFFF",
    },
  },
  {
    id: "campfire-clay",
    name: "Campfire Clay Mug",
    description:
      "Rustic clay mug with extra grip and weight for tea lovers and slow pours.",
    material: "Clay",
    finish: "Textured",
    basePrice: 24,
    tags: ["rustic", "tea", "textured"],
    palette: {
      body: "#A16207",
      rim: "#78350F",
      handle: "#78350F",
      surface: "#FEF3C7",
    },
  },
  {
    id: "alpine-fog",
    name: "Alpine Fog Mug",
    description:
      "Tall ceramic mug with a misty glaze profile for long coffee sessions.",
    material: "Ceramic",
    finish: "Satin",
    basePrice: 23,
    tags: ["mountain", "mist", "tall"],
    palette: {
      body: "#E2E8F0",
      rim: "#64748B",
      handle: "#64748B",
      surface: "#F8FAFC",
    },
  },
  {
    id: "ocean-tide",
    name: "Ocean Tide Mug",
    description:
      "Wide cup silhouette with sea-glass tones inspired by coastal mornings.",
    material: "Stoneware",
    finish: "Gloss",
    basePrice: 25,
    tags: ["sea", "coastal", "wide"],
    palette: {
      body: "#CCFBF1",
      rim: "#0F766E",
      handle: "#0F766E",
      surface: "#F0FDFA",
    },
  },
  {
    id: "savanna-glow",
    name: "Savanna Glow Mug",
    description:
      "Warm-tone clay mug with a gentle taper inspired by desert landscapes.",
    material: "Clay",
    finish: "Matte",
    basePrice: 24,
    tags: ["desert", "warm", "tapered"],
    palette: {
      body: "#FED7AA",
      rim: "#B45309",
      handle: "#B45309",
      surface: "#FFF7ED",
    },
  },
];

export const defaultMugConfiguration = {
  sizeId: mugSizes[1].id,
  designId: mugDesigns[0].id,
  quantity: 1,
};