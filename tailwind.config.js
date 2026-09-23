import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                ink: {
                    950: '#080a12',
                    900: '#0b0e1a',
                    850: '#0f1424',
                    800: '#141a2e',
                    700: '#1c2440',
                    600: '#2a3355',
                },
                brand: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
            },
            boxShadow: {
                glow: '0 0 0 1px rgba(129,140,248,0.15), 0 20px 60px -20px rgba(79,70,229,0.55)',
                card: '0 10px 40px -18px rgba(0,0,0,0.7)',
            },
            keyframes: {
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'pulse-ring': {
                    '0%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.5)' },
                    '70%': { boxShadow: '0 0 0 12px rgba(239,68,68,0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0)' },
                },
            },
            animation: {
                'fade-up': 'fade-up 0.5s ease-out both',
                shimmer: 'shimmer 2.5s linear infinite',
                'pulse-ring': 'pulse-ring 1.4s ease-out infinite',
            },
        },
    },

    plugins: [forms],
};
