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
      },
      fontFamily: {
        sans: ['Indivisible', 'sans-serif'], // Image nalli iruva typeface
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