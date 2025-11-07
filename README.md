# 🧱 Bricklink Cart Planner

<div align="center">

![Angular](https://img.shields.io/badge/Angular-20.0.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Plan, price, and manage your LEGO part purchases from Bricklink with ease**

[English](#english) • [Español](#español)

</div>

---

## English

### 📖 Overview

**Bricklink Cart Planner** is a modern web application designed to help LEGO enthusiasts efficiently plan and budget their part purchases from Bricklink. Built with the latest Angular technology, this tool streamlines the process of analyzing set inventories, calculating costs, and managing multiple shopping carts.

### ✨ Key Features

#### 🔍 **Smart Set Search**
- Search any LEGO set by number directly from Bricklink's database
- View detailed set information including part counts and images
- Multi-language support (English, Spanish, German, French)

#### 📊 **Comprehensive Inventory Analysis**
- Automatically parse and display all pieces from any LEGO set
- View high-quality images for each part with lazy loading optimization
- See item numbers, descriptions, and quantities at a glance

#### 💰 **Advanced Price Planning**
- Editable price column for each individual piece
- Automatic calculation of total price per piece (quantity × price)
- Real-time subtotal calculation for all pieces
- Add shipping costs for accurate budget planning
- Grand total calculator (pieces + shipping)

#### 💾 **Local Cart Management**
- Save unlimited shopping carts locally in your browser
- Name your carts for easy identification (e.g., "Millennium Falcon - December 2025")
- Load saved carts instantly without re-fetching from Bricklink
- Update existing carts instead of creating duplicates
- Delete carts with confirmation
- Optimized storage with data compression (10 cart limit for performance)

#### 🎨 **Modern UI/UX**
- Beautiful gradient design with purple-pink theme
- Responsive layout for desktop and mobile devices
- Smooth animations and transitions
- Intuitive navigation between search and cart views

### 🚀 Getting Started

#### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (v20.0.1)

#### Installation

```bash
# Clone the repository
git clone https://github.com/KikoMola/bl-cart-planner.git

# Navigate to project directory
cd bl-cart-planner

# Install dependencies
npm install
```

#### Development Server

```bash
# Start the development server
npm start

# The app will be available at http://localhost:4200/
```

#### Building for Production

```bash
# Build the project
npm run build

# Production files will be in the dist/ directory
```

### 🛠️ Technical Stack

- **Framework**: Angular 20.0.0 (Standalone Components)
- **Language**: TypeScript 5.0+
- **State Management**: Angular Signals
- **Styling**: Tailwind CSS
- **i18n**: ngx-translate
- **Backend**: Vercel Serverless Functions (CORS proxy)
- **Storage**: Browser localStorage with compression
- **Change Detection**: Zoneless

### 📁 Project Structure

```
bl-cart-planner/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── home/          # Search and saved carts
│   │   │   └── table/         # Inventory display and pricing
│   │   ├── services/
│   │   │   ├── bricklink.ts   # API communication
│   │   │   ├── cart-storage.ts # localStorage management
│   │   │   └── table-state.ts  # State management
│   │   └── interfaces/        # TypeScript interfaces
│   └── public/
│       └── i18n/              # Translation files
├── api/
│   └── bricklink.ts           # Vercel serverless proxy
└── README.md
```

### 🌐 API Integration

The application uses a serverless function deployed on Vercel to proxy requests to Bricklink, solving CORS restrictions and adding necessary headers. The proxy is located in `/api/bricklink.ts` and handles HTML parsing from Bricklink's inventory pages.

### 🔒 Privacy

All data is stored locally in your browser. No personal information or cart data is sent to external servers (except for fetching set information from Bricklink).

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### 📄 License

This project is licensed under the MIT License.

### 🙏 Acknowledgments

- Data provided by [Bricklink](https://www.bricklink.com)
- Built with [Angular](https://angular.dev)
- Icons and styling inspired by modern design principles

---

## Español

### 📖 Descripción General

**Bricklink Cart Planner** es una aplicación web moderna diseñada para ayudar a los entusiastas de LEGO a planificar y presupuestar eficientemente sus compras de piezas en Bricklink. Construida con la última tecnología de Angular, esta herramienta optimiza el proceso de analizar inventarios de sets, calcular costes y gestionar múltiples carritos de compra.

### ✨ Características Principales

#### 🔍 **Búsqueda Inteligente de Sets**
- Busca cualquier set de LEGO por número directamente desde la base de datos de Bricklink
- Visualiza información detallada del set incluyendo cantidad de piezas e imágenes
- Soporte multiidioma (Inglés, Español, Alemán, Francés)

#### 📊 **Análisis Completo de Inventario**
- Analiza y muestra automáticamente todas las piezas de cualquier set de LEGO
- Visualiza imágenes de alta calidad para cada pieza con optimización de carga diferida
- Consulta números de artículo, descripciones y cantidades de un vistazo

#### 💰 **Planificación Avanzada de Precios**
- Columna de precio editable para cada pieza individual
- Cálculo automático del precio total por pieza (cantidad × precio)
- Cálculo en tiempo real del subtotal de todas las piezas
- Añade costes de envío para una planificación presupuestaria precisa
- Calculadora de total general (piezas + envío)

#### 💾 **Gestión Local de Carritos**
- Guarda carritos de compra ilimitados localmente en tu navegador
- Nombra tus carritos para fácil identificación (ej: "Millennium Falcon - Diciembre 2025")
- Carga carritos guardados instantáneamente sin volver a consultar Bricklink
- Actualiza carritos existentes en lugar de crear duplicados
- Elimina carritos con confirmación
- Almacenamiento optimizado con compresión de datos (límite de 10 carritos por rendimiento)

#### 🎨 **Interfaz Moderna**
- Diseño hermoso con degradado en tema púrpura-rosa
- Layout responsive para dispositivos de escritorio y móviles
- Animaciones y transiciones suaves
- Navegación intuitiva entre vistas de búsqueda y carrito

### 🚀 Comenzar

#### Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Angular CLI (v20.0.1)

#### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/KikoMola/bl-cart-planner.git

# Navegar al directorio del proyecto
cd bl-cart-planner

# Instalar dependencias
npm install
```

#### Servidor de Desarrollo

```bash
# Iniciar el servidor de desarrollo
npm start

# La aplicación estará disponible en http://localhost:4200/
```

#### Compilar para Producción

```bash
# Compilar el proyecto
npm run build

# Los archivos de producción estarán en el directorio dist/
```

### 🛠️ Stack Técnico

- **Framework**: Angular 20.0.0 (Componentes Standalone)
- **Lenguaje**: TypeScript 5.0+
- **Gestión de Estado**: Angular Signals
- **Estilos**: Tailwind CSS
- **i18n**: ngx-translate
- **Backend**: Funciones Serverless de Vercel (proxy CORS)
- **Almacenamiento**: localStorage del navegador con compresión
- **Detección de Cambios**: Zoneless

### 📁 Estructura del Proyecto

```
bl-cart-planner/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── home/          # Búsqueda y carritos guardados
│   │   │   └── table/         # Visualización de inventario y precios
│   │   ├── services/
│   │   │   ├── bricklink.ts   # Comunicación con API
│   │   │   ├── cart-storage.ts # Gestión de localStorage
│   │   │   └── table-state.ts  # Gestión de estado
│   │   └── interfaces/        # Interfaces TypeScript
│   └── public/
│       └── i18n/              # Archivos de traducción
├── api/
│   └── bricklink.ts           # Proxy serverless de Vercel
└── README.md
```

### 🌐 Integración con API

La aplicación utiliza una función serverless desplegada en Vercel para hacer proxy de las peticiones a Bricklink, solucionando las restricciones de CORS y añadiendo los headers necesarios. El proxy está ubicado en `/api/bricklink.ts` y maneja el parseo de HTML de las páginas de inventario de Bricklink.

### 🔒 Privacidad

Todos los datos se almacenan localmente en tu navegador. No se envía información personal ni datos de carritos a servidores externos (excepto para obtener información de sets desde Bricklink).

### 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor, siéntete libre de enviar un Pull Request.

### 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

### 🙏 Agradecimientos

- Datos proporcionados por [Bricklink](https://www.bricklink.com)
- Construido con [Angular](https://angular.dev)
- Iconos y estilos inspirados en principios de diseño moderno
