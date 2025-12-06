import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.5' }],      // 14px
        'sm': ['0.9375rem', { lineHeight: '1.5' }],     // 15px
        'base': ['1rem', { lineHeight: '1.6' }],        // 16px (default)
        'lg': ['1.125rem', { lineHeight: '1.6' }],      // 18px
        'xl': ['1.25rem', { lineHeight: '1.6' }],       // 20px
        '2xl': ['1.5rem', { lineHeight: '1.5' }],       // 24px
        '3xl': ['1.875rem', { lineHeight: '1.4' }],     // 30px
        '4xl': ['2.25rem', { lineHeight: '1.3' }],      // 36px
        '5xl': ['3rem', { lineHeight: '1.2' }],         // 48px
      },
    },
  },
  plugins: [],
};

export default config;
