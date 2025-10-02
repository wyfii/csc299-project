# Trench Insurance - Design System & Style Guide

## 🎨 Design Philosophy

**Dark, cinematic, raw, and industrial** — Built for the trenches. This is not a template; every element should feel handcrafted, intentional, and alive. Think high-stakes DeFi meets tactical operations dashboard.

---

## 🎯 Color Palette

### Primary Colors

```css
/* Pure Black - Base Background */
--trench-dark: #000000

/* Trench Orange - Primary Accent */
--trench-orange: #ff6b00

/* Secondary Orange (Hover States) */
--orange-500: #ff8533
```

### Neutral Grays

```css
/* Text & Borders */
--gray-50: #fafafa   /* Subtle highlights */
--gray-100: #f5f5f5
--gray-200: #e5e5e5
--gray-300: #d4d4d4
--gray-400: #a3a3a3
--gray-500: #737373  /* Secondary text */
--gray-600: #525252
--gray-700: #404040  /* Borders */
--gray-800: #262626  /* Card backgrounds */
--gray-900: #171717  /* Dark cards */
```

### Usage

- **Background**: Pure black (`#000000`)
- **Primary Actions**: Trench Orange (`#ff6b00`)
- **Text Primary**: White or `gray-100`
- **Text Secondary**: `gray-500`
- **Borders**: `gray-700` or `gray-800`
- **Hover States**: `orange-500` for buttons, `gray-900` for cards

---

## 📐 Typography

### Fonts

```typescript
// Primary Font (Body Text)
font-family: Inter, sans-serif

// Mono Font (Numbers, Addresses, Code)
font-family: 'JetBrains Mono', monospace
```

### Font Sizes

```css
/* Display - Hero Numbers */
.text-8xl { font-size: 6rem; line-height: 1; }      /* 96px */
.text-7xl { font-size: 4.5rem; line-height: 1; }    /* 72px */

/* Headings */
.text-6xl { font-size: 3.75rem; line-height: 1; }   /* 60px */
.text-5xl { font-size: 3rem; line-height: 1; }      /* 48px */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; } /* 36px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; } /* 24px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; } /* 20px */

/* Body */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; } /* 18px */
.text-base { font-size: 1rem; line-height: 1.5rem; }    /* 16px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; } /* 14px */
.text-xs { font-size: 0.75rem; line-height: 1rem; }     /* 12px */
```

### Font Weights

```css
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
```

### Typography Usage

```tsx
// Hero Numbers (Vault Balance)
<h1 className="text-8xl font-bold text-white font-mono-numbers">
  $2,456,789
</h1>

// Section Headings
<h2 className="text-3xl font-bold text-white uppercase tracking-wider">
  Eligible Holders
</h2>

// Card Titles
<h3 className="text-lg font-semibold text-gray-100">
  Insurance Vault
</h3>

// Body Text
<p className="text-base text-gray-400 leading-relaxed">
  Premium insurance for holders in the trench
</p>

// Labels / Metadata
<span className="text-xs text-gray-500 uppercase tracking-widest">
  Last Updated
</span>

// Numbers / Addresses (Always use mono)
<span className="font-mono-numbers text-2xl">
  1,234,567.89
</span>
```

---

## 🔘 Buttons

### Primary Button (Orange Fill)

```tsx
<button
  className="
    px-5 py-2.5 
    bg-trench-orange text-black 
    font-bold text-xs uppercase tracking-widest
    hover:bg-orange-500 hover:shadow-lg hover:shadow-trench-orange/30
    transition-all duration-200
  "
  style={{ 
    clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' 
  }}
>
  Connect Wallet
</button>
```

**Usage**: Primary CTAs, important actions (Connect, Claim, Submit)

### Secondary Button (Outlined)

```tsx
{/* Seamless outlined button with connected corners */}
<div 
  className="relative p-[2px] transition-all duration-200"
  style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
>
  {/* Border gradient */}
  <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800" />
  
  {/* Content - aligned clip-path for seamless corners */}
  <button className="
    relative px-5 py-2.5 bg-black 
    font-bold text-xs uppercase tracking-widest
    text-gray-500 hover:text-gray-400 hover:bg-gray-900/50
    transition-all duration-200
  "
  style={{ clipPath: 'polygon(6px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 6px), calc(100% - 6px) calc(100% - 2px), 2px calc(100% - 2px), 2px 6px)' }}>
    Send
  </button>
</div>
```

**Usage**: Secondary actions, tabs, filters (Docs, Settings, Tab switches)

### Button Animations (Framer Motion)

```tsx
import { motion } from 'framer-motion'

<motion.button
  whileTap={{ scale: 0.95 }}    // Squeeze on click
  whileHover={{ scale: 1.03 }}  // Subtle grow on hover
  className="..."
>
  Click Me
</motion.button>
```

### Button States

```tsx
// Disabled
<button 
  disabled
  className="... opacity-50 cursor-not-allowed"
>
  Disabled
</button>

// Loading
<button className="... relative">
  <span className="opacity-0">Connect Wallet</span>
  <span className="absolute inset-0 flex items-center justify-center">
    Loading...
  </span>
</button>
```

---

## 📦 Cards & Containers

### Standard Card

```tsx
<div className="
  bg-gray-900/50 
  border border-gray-800 
  backdrop-blur-sm
  p-6 
  transition-all duration-300
  hover:border-gray-700
"
style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
  {/* Card content */}
</div>
```

### Insurance Vault Card (Hero)

```tsx
<div className="
  relative 
  bg-gradient-to-br from-gray-900 to-black
  border-2 border-trench-orange/20
  backdrop-blur-xl
  p-8 md:p-12
  overflow-hidden
"
style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
  
  {/* Decorative elements */}
  <div className="absolute top-0 right-0 w-1 h-20 bg-trench-orange" />
  <div className="absolute bottom-0 left-0 w-1 h-32 bg-trench-orange/50" />
  
  {/* Content */}
  <h2 className="text-sm text-gray-500 uppercase tracking-widest mb-4">
    Insurance Vault
  </h2>
  <div className="text-8xl font-bold text-white font-mono-numbers glow-text">
    ${vaultBalance.toLocaleString()}
  </div>
</div>
```

### Holder Card (List Item)

```tsx
<div className="
  group
  bg-gray-900/30 
  border-l-4 border-trench-orange/30
  backdrop-blur-sm
  p-4
  transition-all duration-300
  hover:bg-gray-900/60
  hover:border-trench-orange
"
style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
  {/* Holder content */}
</div>
```

---

## ✨ Special Effects

### Glow Text (For Important Numbers)

```css
/* In globals.css */
.glow-text {
  text-shadow: 
    0 0 20px rgba(255, 107, 0, 0.5),
    0 0 40px rgba(255, 107, 0, 0.3),
    0 0 60px rgba(255, 107, 0, 0.1);
}
```

```tsx
<h1 className="text-7xl font-bold text-trench-orange glow-text">
  $2,456,789
</h1>
```

### Grain Overlay (Background Texture)

```css
/* In globals.css */
.grain-overlay {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg...");
  opacity: 0.03;
  pointer-events: none;
  z-index: 50;
}
```

```tsx
// In layout.tsx or page
<div className="grain-overlay" />
```

### Angular Clip Paths (Industrial Look)

```tsx
// Small cut (buttons, small cards)
style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}

// Medium cut (cards)
style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}

// Large cut (hero sections)
style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
```

### Decorative Lines

```tsx
// Vertical accent line
<div className="absolute top-0 right-0 w-1 h-20 bg-trench-orange" />

// Horizontal divider
<div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

// Angled line
<div className="absolute top-0 left-0 w-32 h-1 bg-trench-orange transform -rotate-45" />
```

---

## 🎬 Animations (Framer Motion)

### Page Entry Animation

```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

### Staggered List Animation

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ staggerChildren: 0.1 }}
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: i * 0.05 }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

### Button Interactions

```tsx
<motion.button
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.03 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Button
</motion.button>
```

### Number Counter Animation

```tsx
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: "spring", duration: 0.8 }}
  className="text-8xl font-bold"
>
  ${animatedValue}
</motion.div>
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Tailwind breakpoints */
sm: 640px   /* Small devices (large phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large devices (desktops) */
2xl: 1536px /* 2X large devices (large desktops) */
```

### Responsive Patterns

```tsx
// Responsive padding
<div className="px-4 sm:px-6 lg:px-8">

// Responsive text size
<h1 className="text-4xl md:text-6xl lg:text-8xl">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Show/hide on mobile
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>

// Responsive button size
<button className="px-4 py-2 text-xs md:px-6 md:py-3 md:text-sm">
```

---

## 🎯 Component Examples

### Wallet Address Display

```tsx
<span className="font-mono text-sm text-gray-400">
  {address.slice(0, 4)}...{address.slice(-4)}
</span>
```

### Balance Display

```tsx
<div className="font-mono-numbers text-2xl font-bold text-white">
  {balance.toLocaleString()} SOL
</div>
```

### Status Badge

```tsx
<span className="
  inline-flex items-center
  px-3 py-1
  text-xs font-bold uppercase tracking-wider
  bg-trench-orange/20 text-trench-orange
  border border-trench-orange/30
"
style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
  Eligible
</span>
```

### Loading Spinner

```tsx
<div className="animate-spin h-5 w-5 border-2 border-trench-orange border-t-transparent rounded-full" />
```

---

## 🚫 Don't Do This

### ❌ Avoid

```tsx
// Don't use rounded corners
<div className="rounded-lg"> ❌

// Don't use bright colors besides orange
<div className="bg-blue-500"> ❌

// Don't use regular numbers without mono font
<span className="text-2xl">1234567</span> ❌

// Don't use emojis
<button>Click me! 🚀</button> ❌

// Don't use soft shadows
<div className="shadow-xl"> ❌
```

### ✅ Do Instead

```tsx
// Use angular clip-paths
<div style={{ clipPath: '...' }}> ✅

// Use orange or grayscale
<div className="bg-gray-900"> ✅

// Always use mono for numbers
<span className="font-mono-numbers text-2xl">1234567</span> ✅

// Keep it clean, no emojis
<button>Click me</button> ✅

// Use glow effects or border highlights
<div className="border-trench-orange/20"> ✅
```

---

## 📋 Quick Reference

### Color Classes

```css
bg-black           /* Pure black background */
bg-gray-900        /* Dark card */
bg-gray-800        /* Darker card */
bg-trench-orange   /* Primary action */
text-white         /* Primary text */
text-gray-400      /* Secondary text */
text-gray-500      /* Tertiary text */
border-gray-800    /* Subtle border */
border-trench-orange /* Accent border */
```

### Spacing Scale

```css
p-4  = 1rem  = 16px
p-6  = 1.5rem = 24px
p-8  = 2rem   = 32px
p-12 = 3rem   = 48px

gap-4 = 1rem
gap-6 = 1.5rem
gap-8 = 2rem
```

### Common Utilities

```css
uppercase           /* UPPERCASE TEXT */
tracking-widest     /* L E T T E R   S P A C I N G */
font-bold           /* Bold weight */
backdrop-blur-sm    /* Glass effect */
transition-all      /* Smooth transitions */
hover:scale-105     /* Hover grow */
```

---

## 🎨 CSS Variables (Tailwind Config)

```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        'trench-dark': '#000000',
        'trench-orange': '#ff6b00',
      },
      fontFamily: {
        'mono-numbers': ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
}
```

---

## 📦 Component Structure Example

```tsx
// Full example: Holder Card
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.3 }}
  className="
    group relative
    bg-gray-900/30 
    border-l-4 border-trench-orange/30
    backdrop-blur-sm p-6
    transition-all duration-300
    hover:bg-gray-900/60 hover:border-trench-orange
  "
  style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
>
  {/* Rank Badge */}
  <div className="
    absolute -left-4 top-6
    w-12 h-12 flex items-center justify-center
    bg-black border-2 border-trench-orange
    font-bold text-trench-orange
  "
  style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
    #{rank}
  </div>

  {/* Content */}
  <div className="flex items-center justify-between ml-8">
    {/* Wallet */}
    <span className="font-mono text-sm text-gray-400">
      {wallet.slice(0, 4)}...{wallet.slice(-4)}
    </span>

    {/* Balance */}
    <span className="font-mono-numbers text-xl font-bold text-white">
      {balance.toLocaleString()}
    </span>
  </div>

  {/* Decorative line */}
  <div className="absolute bottom-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-trench-orange/50 to-transparent" />
</motion.div>
```

---

## 🚀 Getting Started

### 1. Import Fonts

```tsx
// app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})
```

### 2. Add Base Styles

```css
/* app/globals.css */
body {
  font-family: var(--font-inter), sans-serif;
  background: #000000;
  color: white;
}

.font-mono-numbers {
  font-family: var(--font-jetbrains-mono), monospace;
}
```

### 3. Use Framer Motion

```tsx
import { motion } from 'framer-motion'

// Wrap components with motion
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  {content}
</motion.div>
```

---

**Questions?** Check the existing components in `/components` for live examples!

