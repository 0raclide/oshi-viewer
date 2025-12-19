# Oshi Viewer - Japanese Sword Documentation Viewer

## Project Overview

A webapp to visualize Tokubetsu Juyo (Special Designation) Japanese sword documentation, including oshigata (sword tracings), setsumei (descriptive texts), English translations, OCR data, and structured metadata.

**Data Source**: `/Users/christopherhill/Desktop/Claude_project/Oshi_data`
**IMPORTANT**: Do NOT modify any files in the Oshi_data repository. This project is read-only access.

---

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Design**: Desktop-first, responsive to mobile, dark theme

---

## Project Structure

```
oshi-viewer/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── api/                  # API routes for data access
│   │   │   ├── collections/      # Collection stats
│   │   │   ├── volumes/          # Volume listing
│   │   │   ├── items/            # Item listing
│   │   │   ├── item/             # Single item data
│   │   │   ├── search/           # Search endpoint
│   │   │   └── image/            # Image serving
│   │   ├── collection/           # Collection & volume pages
│   │   ├── item/                 # Item detail page
│   │   ├── search/               # Search results page
│   │   └── page.tsx              # Home/Index page
│   ├── components/               # React components
│   │   ├── CollectionCard.tsx
│   │   ├── DeepAnalytics.tsx     # Full metadata viewer
│   │   ├── icons.tsx
│   │   ├── ItemCard.tsx
│   │   ├── MetadataPanel.tsx     # Side panel metadata
│   │   └── SearchBar.tsx
│   ├── hooks/
│   │   └── useBookmarks.ts       # Bookmark persistence
│   ├── lib/
│   │   └── data.ts               # Data access utilities
│   └── types/
│       └── index.ts              # TypeScript types
├── .env.local                    # Environment configuration
└── CLAUDE.md                     # This file
```

---

## Data Source Structure

### Collections

| Collection | Volumes | Items | Translations | Description |
|------------|---------|-------|--------------|-------------|
| **Tokuju** (Tokubetsu Juyo) | 27 | ~826 | All 27 volumes | Special Designation swords |
| **Juyo** | 70 | ~15,892 | 8 volumes | Important Designation swords |

### File Naming Convention

- `item_XXX_oshigata.jpg` - Sword diagram/tracing image
- `item_XXX_setsumei.jpg` - Description/specification text image
- `item_XXX_metadata.json` - Structured JSON metadata (180+ fields)
- `item_XXX_japanese.txt` - OCR'd Japanese text
- `item_XXX_translation.md` - English translation (Markdown)

---

## Key Features

1. **Index/Category Browser** - Browse collections with stats
2. **Volume Browser** - List volumes with item counts
3. **Search** - Search by smith name across all collections
4. **Item Grid** - 2-6 cards per row depending on screen size
5. **Item Detail View** - Images, Japanese text, English translation
6. **Metadata Side Panel** - Key sword information at a glance
7. **Deep Analytics** - Full 180+ field metadata viewer
8. **Bookmarks** - Save items to localStorage

---

## Running the App

```bash
cd /Users/christopherhill/Desktop/Claude_project/oshi-viewer
npm install
npm run dev
```

Then open http://localhost:3000

---

## API Endpoints

- `GET /api/collections` - List all collections with stats
- `GET /api/volumes/[collection]` - List volumes in a collection
- `GET /api/items/[collection]/[volume]` - List items in a volume
- `GET /api/item/[collection]/[volume]/[item]` - Get full item data
- `GET /api/search?q=[query]` - Search items
- `GET /api/image/[collection]/vol_XXX/item_XXX_[type].jpg` - Serve images

---

## UI Design

### Responsive Breakpoints

| Breakpoint | Width | Grid Columns |
|------------|-------|--------------|
| Desktop XL | ≥1440px | 6 cards |
| Desktop | ≥1024px | 5 cards |
| Tablet | ≥768px | 3 cards |
| Mobile | <768px | 2 cards |

### Theme

- Dark background: `#1a1a1a`
- Surface: `#242424`
- Border: `#333333`
- Accent: `#3b82f6` (blue)
- Bilingual labels throughout (Japanese · English)

---

## Development Notes

- Start with Tokuju collection (complete translations available)
- Test with vol_001 which has 21 items
- Handle missing translations gracefully (show images + Japanese only)
- Images served directly from Oshi_data via API route
