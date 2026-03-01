/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#135bec',
                'background-light': '#fdfcf9',
                'background-dark': '#101622',
                'marian-soft': '#e7effd',
            },
            fontFamily: {
                display: ['Public Sans', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            borderRadius: {
                DEFAULT: '0.25rem',
                lg: '0.5rem',
                xl: '0.75rem',
                full: '9999px',
            }
        }
    },
    plugins: [],
};
