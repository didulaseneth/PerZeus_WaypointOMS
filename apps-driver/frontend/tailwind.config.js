export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary & Brand Colors
        whiteCustom: "#FFFFFF",
        blackCustom: "#010138",
        purplePrimary: "#4D4DE9",

        // Secondary Colors
        secondaryGreen: "#BDF6CC",
        secondaryPink: "#F9B9D9",
        secondaryYellow: "#FFDD99",

        // Neutral Palette
        neutral1: "#E7E7FD",
        neutral2: "#D4D4FB",
        neutral3: "#C4C4FF",
        neutral4: "#9797F6",
        neutral5: "#7171F1",

        // Gray Palette
        gray1: "#F5F5FE",
        gray2: "#EBEBF8",
        gray3: "#DDDDDF",
        gray4: "#C5C5E2",
        gray5: "#9292B4",
        gray6: "#5F5F79",

        // Soft Dark Palette (premium dark mode — not pure black)
        // Inspired by slate-900 family; blended with blackCustom hue
        dark900: "#0F1623", // page bg  — deep navy-slate
        dark800: "#1A2235", // card bg  — slightly lighter navy
        dark700: "#243047", // card alt — medium navy
        dark600: "#2E3D5C", // border   — visible but subtle
        dark500: "#4A5E80", // muted text backdrop
        darkText1: "#E8ECF4", // primary text — near-white, not harsh
        darkText2: "#9BAEC8", // secondary text — muted blue-gray
        darkText3: "#6B82A0", // placeholder / dimmed text

        // Evening / dusk palette (warm, softer light)
        eveningBg: "#FFF6EE",           // warm cream page
        eveningCard: "#FFFBF6",         // soft ivory card
        eveningCardAlt: "#F5EDE4",      // slightly deeper warm alt
        eveningHeader: "#2A1F3D",       // warm deep purple header
        eveningBorder: "#E8D9C8",       // soft warm border
        eveningText: "#1F1630",         // deep warm text
        eveningTextSecondary: "#5C4A3A", // warm secondary
        eveningTextMuted: "#8A7360",    // muted warm label
      },
      fontFamily: {
        sans: ['Poppings'], // Image nalli iruva typeface
      },
      fontSize: {
        'title': ['32px', { lineHeight: '40px', fontWeight: '750' }],
        'subtitle': ['24px', { lineHeight: '32px', fontWeight: '750' }],
        'heading': ['20px', { lineHeight: '28px', fontWeight: '750' }],
        'paragraph': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'secondaryText': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'smallText': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      }
    },
  },
  plugins: [],
}