/** @type {import('tailwindcss').Config} */
export default {
  content: ['./views/**/*.pug'],
  theme: {
    fontFamily: {
      display: ['Gilroy', 'sans-serif'],
      body: ['Graphik', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: { // Agrupamos los colores bajo "primary"
          DEFAULT: '#B75E54', // Usado cuando solo se especifica `bg-primary`
          light: '#E05E58', // Usado como `bg-primary-light`
          accent: '#d4a574', // Usado como `bg-primary-accent`
          background: '#fff8f3', // Usado como `bg-primary-background`
        },
        colorError: '#E05E58', // Colores independientes
        boton: '#d4a574',
        botonHover: '#B75E54',
      },
    },
  },
  plugins: [],
};


// Rojo Terroso: #A23E48

// Mezcla de rojo de carne con tonos marrones.
// Marrón Rosado: #B75E54

// Un marrón suave con matices rosados, evocando carnes asadas y café con leche.
// Beige Tostado: #C9A583

// Tono neutro, perfecto para combinar elementos de café y carne cocida.
// Cobre Oscuro: #8C4C40

// Un tono metálico rojizo que equilibra ambos elementos.
// Marrón Arcilla: #7B4A2D