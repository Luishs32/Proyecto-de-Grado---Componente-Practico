# RetailOpt — Sistema de Optimización de Reposición de Inventarios

**Proyecto de Grado · Universidad Nacional Abierta y a Distancia (UNAD)**  
**Programa:** Ingeniería de Sistemas  
**Curso:** Proyecto de Grado 202016907  
**Fase:** 4 — Desarrollo de la Propuesta Ingenieril  
**Nivel TRL:** 5 — Prototipo Funcional  

---

## Descripción del Proyecto

RetailOpt es un prototipo funcional que implementa un modelo de optimización de pedidos para empresas del sector retail, incorporando **variables físicas de exhibición en góndola** (caras, niveles, profundidad) al algoritmo de reposición de inventarios.

### Problema que resuelve
Los sistemas tradicionales de reposición se basan únicamente en datos históricos de ventas, sin considerar la capacidad real de exhibición de cada tienda. Esto genera:
- Quiebres de stock en productos de alta rotación
- Sobre almacenamiento de productos de baja rotación
- Ineficiencia en la planificación de pedidos

---

## Estructura del Proyecto

```
RetailOpt/
├── index.html              # Punto de entrada principal
├── README.md               # Este archivo
│
├── css/
│   └── styles.css          # Estilos globales de la aplicación
│
└── js/
    ├── data.js             # Datos del sistema (tiendas, productos, góndola, inventario)
    ├── algoritmo.js        # Algoritmo de reposición + utilidades de UI
    ├── app.js              # Controlador principal (estado y enrutamiento)
    │
    └── views/
        ├── dashboard.js    # Vista: Panel de control y alertas
        ├── productos.js    # Vista: Gestión de productos
        ├── gondola.js      # Vista: Configuración física de góndola
        ├── inventario.js   # Vista: Stock actual por tienda
        ├── reposicion.js   # Vista: Algoritmo de reposición (vista principal)
        └── reportes.js     # Vista: Reportes de quiebres e indicadores
```

---

## Cómo ejecutar

1. Descarga o clona el proyecto.
2. Abre el archivo **`index.html`** directamente en cualquier navegador web moderno.
3. No requiere instalación de dependencias, servidor web ni conexión a internet.

> Compatible con: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

---

## Algoritmo de Reposición

El núcleo del sistema calcula la reposición sugerida usando la siguiente lógica:

```
Capacidad de Exhibición = Caras × Niveles × Profundidad
Venta Promedio Diaria   = promedio(ventas de los últimos 7 días)
Stock de Seguridad      = ceil(Venta Promedio × 1.5)
Punto de Reorden        = ceil(Venta Promedio × Lead Time) + Stock Seguridad
Stock Objetivo          = Capacidad de Exhibición + Stock Seguridad
Pedido Sugerido         = MAX(0, Stock Objetivo − Stock Actual)
```

### Niveles de riesgo

| Nivel    | Condición                                          |
|----------|----------------------------------------------------|
| QUIEBRE  | Stock = 0                                          |
| CRÍTICO  | Stock < Venta Promedio Diaria                      |
| ALTO     | Stock < Punto de Reorden                           |
| MEDIO    | Stock < 50% del Stock Objetivo                     |
| BAJO     | Stock ≥ 50% del Stock Objetivo                     |

---

## Módulos del Sistema

| Módulo              | Req. Funcional | Descripción                                            |
|---------------------|----------------|--------------------------------------------------------|
| Dashboard           | —              | KPIs, alertas prioritarias y resumen general           |
| Gestión de Productos| RF1            | Catálogo de productos registrados por tienda           |
| Config. Góndola     | RF2            | Registro de caras, niveles y profundidad por producto  |
| Inventario          | RF3, RF5       | Stock actual e historial de ventas (7 días)            |
| Reposición          | RF4, RF6       | Algoritmo de pedido con ajuste de lead time            |
| Reportes            | RF7            | Quiebres de stock, resumen por tienda e impacto        |

---

## Datos del prototipo

- **3 tiendas** (Tienda Centro, Pinares, Cuba — Pereira)
- **8 productos** en 6 categorías
- **24 registros** de inventario con historial de ventas simulado
- **1 quiebre activo** (Pan Tajado — Tienda Pinares) para demostración

---

## Metodología

Desarrollado bajo metodología **Scrum** con sprints incrementales:

- Sprint 1: Análisis de requerimientos y diagnóstico
- Sprint 2: Modelo de base de datos y diseño
- Sprint 3: Prototipo funcional de la interfaz *(este entregable)*
- Sprint 4: Implementación del algoritmo de reposición *(este entregable)*
- Sprint 5: Pruebas y análisis comparativo

---

## Autores

- Jessica Catherine Lozano Riasco  
- Luis David Hurtado Serna  
- Olegario Mejia Acevedo  

**Tutor:** Ruben Dario Ordoñez  
**Año:** 2026
