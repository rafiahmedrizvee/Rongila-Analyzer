/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#211A17',
        'ink-soft': '#4A3F38',
        paper: '#F7F2EA',
        'paper-dim': '#EEE5D8',
        line: '#DED0BC',
        accent: {
          DEFAULT: '#1F6F5C',
          light: '#3E8E79',
          dark: '#134A3C',
          tint: '#E4EFEA',
        },
        scale: {
          veryfair: '#F3DFCF',
          fair: '#EACBAA',
          light: '#DEB48C',
          medium: '#C58F62',
          olive: '#AD7C4C',
          tan: '#8F5D34',
          brown: '#6B4226',
          deep: '#402716',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        bengali: ['"Hind Siliguri"', '"Inter"', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '20px',
        xl: '28px',
      },
      maxWidth: {
        prose: '68ch',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(33, 26, 23, 0.06), 0 8px 24px rgba(33, 26, 23, 0.06)',
      },
    },
  },
  plugins: [],
}
