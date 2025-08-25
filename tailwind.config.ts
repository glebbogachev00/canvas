import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'near-white': '#FAFAFA',
        'near-black': '#0A0A0A',
        'accent': '#FF6B35',
        'border': '#E5E5E5',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['Menlo', 'Monaco', 'monospace'],
      },
      spacing: {
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
      },
      animation: {
        'micro': 'ease-in-out 150ms',
        'state': 'ease-in-out 300ms',
      }
    },
  },
  plugins: [],
}
export default config