# Tabiya Taxonomy Explorer - Design System

**Source:** Tabiya Design System (tabiya-design-system_DRAFT.md)
**Application:** Taxonomy Explorer Web Application

---

## 1. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Tabiya Green** | `#00FF91` | rgb(0, 255, 145) | Primary buttons, highlights, accents (use sparingly) |
| **Tabiya Gray** | `#F8F5F0` | rgb(248, 245, 240) | Page backgrounds |

### Secondary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Soft Green** | `#E4F8E2` | Hover states, light backgrounds |
| **Green 2** | `#26B87D` | Secondary accents |
| **Green 3 (Dark Teal)** | `#247066` | Secondary text, dark accents |
| **Oxford Blue** | `#002147` | Primary text, headers, dark backgrounds |

### Extended Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Light Green** | `#D7FFEF` | Highlighted cards, success states |
| **Border Light** | `#E5E7EB` | Card borders, dividers |
| **Text Muted** | `#6B7280` | Secondary text, labels, captions |
| **Warning** | `#F59E0B` | Warning states |
| **Error** | `#EF4444` | Error states |
| **Info Blue** | `#3B82F6` | Informational elements |
| **White** | `#FFFFFF` | Card backgrounds, content areas |

### CSS Custom Properties

```css
:root {
  /* Primary */
  --color-tabiya-green: #00FF91;
  --color-tabiya-green-hover: #00E682;
  --color-tabiya-gray: #F8F5F0;

  /* Secondary */
  --color-soft-green: #E4F8E2;
  --color-green-2: #26B87D;
  --color-green-3: #247066;
  --color-oxford-blue: #002147;

  /* Extended */
  --color-light-green: #D7FFEF;
  --color-border: #E5E7EB;
  --color-text-muted: #6B7280;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  --color-white: #FFFFFF;
}
```

---

## 2. Typography

### Font Family

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

| Element | Size | Weight | Line Height | Color |
|---------|------|--------|-------------|-------|
| **H1** | 48px | 700 | 1.1 | Oxford Blue |
| **H2** | 32px | 700 | 1.2 | Oxford Blue |
| **H3** | 24px | 600 | 1.3 | Oxford Blue |
| **H4** | 18px | 600 | 1.4 | Oxford Blue |
| **Body** | 15px | 400 | 1.6 | Oxford Blue |
| **Body Small** | 14px | 400 | 1.5 | Oxford Blue / Muted |
| **Caption** | 12px | 500 | 1.4 | Text Muted |
| **Overline** | 12px | 600 | 1.2 | Green 3 |

### CSS Custom Properties

```css
:root {
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  --font-size-xs: 11px;
  --font-size-sm: 13px;
  --font-size-base: 15px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  --font-size-2xl: 32px;
  --font-size-3xl: 48px;
}
```

---

## 3. Spacing System

Based on 4px base unit:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing, icon gaps |
| `--space-2` | 8px | Small gaps, inline elements |
| `--space-3` | 12px | Component internal padding |
| `--space-4` | 16px | Standard gap, card padding |
| `--space-5` | 20px | Card padding (comfortable) |
| `--space-6` | 24px | Section gaps |
| `--space-8` | 32px | Section margins |
| `--space-10` | 40px | Large section breaks |
| `--space-12` | 48px | Major section divisions |

---

## 4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small elements, tags |
| `--radius-md` | 8px | Cards, inputs (standard) |
| `--radius-lg` | 12px | Large cards, modals |
| `--radius-xl` | 16px | Hero cards |
| `--radius-full` | 9999px | Pill buttons, avatars |

---

## 5. Components

### Buttons

#### Primary Button (Pill Shape)
```css
.btn-primary {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  background: var(--color-tabiya-green);
  color: var(--color-oxford-blue);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 150ms ease-out;
}

.btn-primary:hover {
  background: var(--color-tabiya-green-hover);
}
```

#### Secondary Button (Outline)
```css
.btn-secondary {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  color: var(--color-oxford-blue);
  border: 2px solid var(--color-oxford-blue);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 150ms ease-out;
}

.btn-secondary:hover {
  background: var(--color-oxford-blue);
  color: var(--color-white);
}
```

#### Ghost Button
```css
.btn-ghost {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  color: var(--color-green-3);
  border: none;
  cursor: pointer;
  transition: color 150ms ease-out;
}

.btn-ghost:hover {
  color: var(--color-oxford-blue);
}
```

### Cards

```css
.card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.card-highlight {
  background: var(--color-light-green);
  border-color: var(--color-green-3);
}
```

### Tags / Pills

```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  background: var(--color-soft-green);
  color: var(--color-green-3);
  border: 1px solid var(--color-green-3);
  border-radius: var(--radius-full);
}
```

### Navigation Tabs

```css
.nav-tab {
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  transition: color 150ms ease-out;
}

.nav-tab:hover {
  color: var(--color-oxford-blue);
}

.nav-tab.active {
  color: var(--color-oxford-blue);
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-tabiya-green);
}
```

### Input Fields

```css
.input {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 14px;
  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
}

.input:focus {
  outline: none;
  border-color: var(--color-tabiya-green);
  box-shadow: 0 0 0 3px rgba(0, 255, 145, 0.15);
}
```

---

## 6. Iconography

### Style Guidelines
- **Icon Library:** Lucide (lucide.dev)
- **Style:** Stroke-based (not filled)
- **Stroke Weight:** 1.5-2px
- **Sizes:** 16px, 20px, 24px
- **Color:** Inherit from parent or use Oxford Blue / Green 3

### Common Icons

| Purpose | Icon Name |
|---------|-----------|
| Search | `search` |
| Expand | `chevron-right` |
| Collapse | `chevron-down` |
| Close | `x` |
| Language | `globe` |
| Download | `download` |
| External Link | `external-link` |
| Info | `info` |
| Check | `check` |
| Warning | `alert-triangle` |

---

## 7. Shadows & Elevation

**Tabiya uses flat design with minimal shadows.**

| Level | Value | Usage |
|-------|-------|-------|
| None | `none` | Default for most elements |
| Subtle | `0 1px 2px rgba(0,0,0,0.05)` | Dropdowns, tooltips |
| Elevated | `0 4px 12px rgba(0,0,0,0.1)` | Modals (rare) |

**General Rule:** Prefer borders over shadows for visual separation.

---

## 8. Layout Grid

### Max Width
- **Content max-width:** 1280px
- **Wide content:** 1400px
- **Page padding:** 32px horizontal

### Grid System
```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}

.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
```

---

## 9. Motion & Animation

### Duration
| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Micro-interactions, hover |
| `--duration-normal` | 200ms | Standard transitions |
| `--duration-slow` | 300ms | Complex animations |

### Easing
```css
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Standard Transition
```css
transition: all 150ms cubic-bezier(0, 0, 0.2, 1);
```

---

## 10. Accessibility

### Color Contrast (WCAG AA Compliant)
- Oxford Blue on White: 16.75:1 ✓
- Oxford Blue on Tabiya Gray: 14.2:1 ✓
- Green 3 on White: 5.1:1 ✓
- Text Muted on White: 4.6:1 ✓

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--color-tabiya-green);
  outline-offset: 2px;
}
```

### Interactive Elements
- Minimum touch target: 44x44px
- Clear hover/active states
- Keyboard navigable

---

## 11. Do's and Don'ts

### Do
- Use flat design with borders instead of shadows
- Keep the color palette restrained
- Use generous white space
- Maintain consistent border radius (8-12px for cards, full for buttons)
- Use Tabiya Green sparingly for emphasis

### Don't
- Add gradients (except in specific brand illustrations)
- Use multiple bright colors competing for attention
- Add heavy drop shadows
- Use rounded corners inconsistently
- Overuse Tabiya Green (it should highlight, not dominate)

---

## 12. Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        'tabiya-green': '#00FF91',
        'tabiya-gray': '#F8F5F0',
        'soft-green': '#E4F8E2',
        'green-2': '#26B87D',
        'green-3': '#247066',
        'oxford-blue': '#002147',
        'light-green': '#D7FFEF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'full': '9999px',
      },
    },
  },
}
```

---

*Adapted from: Tabiya Design System (December 2025)*
*For: Tabiya Taxonomy Explorer*
