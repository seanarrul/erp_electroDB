import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        black: '#041a24',
        bg: 'var(--bg)',
        'bg-raised': 'var(--bg-raised)',
        'bg-hover': 'var(--bg-hover)',
        'bg-subtle': 'var(--bg-subtle)',
        fg: 'var(--fg)',
        'fg-muted': 'var(--fg-muted)',
        'fg-subtle': 'var(--fg-subtle)',
        accent: 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        'border-hover': 'var(--border-hover)',
        brand: '#041a24',

        emerald: {
          50: '#E8F3EE',
          100: '#D5EADB',
          200: '#B4DBC2',
          300: '#84C59A',
          400: '#4FAA71',
          500: '#23894E',
          600: '#041a24', // Midnight ink accent
          700: '#03141c',
          800: '#020f14',
          900: '#010a0e',
        },
        forest: {
          50: '#E8F3EE',
          100: '#D5EADB',
          200: '#B4DBC2',
          500: '#23894E',
          600: '#041a24',
          700: '#03141c',
          800: '#020f14',
        },
        charcoal: {
          900: '#041a24',
          800: '#1c313b',
          700: '#294350',
          600: '#41555f',
          500: '#5c727d',
          400: '#8ca0aa',
        },
        paper: {
          DEFAULT: '#F4F4F0',
          raised: '#FFFFFF',
          hover: '#EAEAE4',
          subtle: '#DFDFD7',
        },
        ink: {
          DEFAULT: '#041a24',
          muted: '#1c313b',
          subtle: '#41555f',
          faint: '#8ca0aa',
        },
      },
      fontFamily: {
        editorial: ['var(--font-editorial)', 'Newsreader', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Geist Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        editorial: '0.18em',
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '3px',
        lg: '4px',
        xl: '4px',
        '2xl': '4px',
        '3xl': '4px',
        full: '9999px',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(4, 26, 36, 0.04)',
        xs: '0 1px 3px 0 rgba(4, 26, 36, 0.06), 0 1px 2px 0 rgba(4, 26, 36, 0.04)',
        sm: '0 2px 4px 0 rgba(4, 26, 36, 0.05)',
        md: '0 4px 6px -1px rgba(4, 26, 36, 0.07), 0 2px 4px -1px rgba(4, 26, 36, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
