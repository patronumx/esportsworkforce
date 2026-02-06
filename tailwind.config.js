/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0f172a', // Slate 900
                secondary: '#1e293b', // Slate 800
                accent: '#3b82f6', // Blue 500
                patronum: {
                    bg: '#0f0418',       // Deepest Purple/Black
                    card: '#1a0b2e',     // Rich Dark Purple
                    hover: '#2d1b4e',    // Lighter Interaction Purple
                    border: '#3e1f5e',   // Muted Purple
                    primary: '#7c3aed',  // Electric Purple (Violet 600)
                    secondary: '#a855f7' // Fuschia/Purple (Purple 500)
                }
            }
        },
    },
    plugins: [],
}
