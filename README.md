# Arrenda

Aplicación privada de simulación de estructuras para arrendar viviendas y locales en España (territorio común). React + TypeScript + Vite, sin servidor de datos ni servicios externos. El repositorio estaba vacío: se ha creado el proyecto desde cero.

## Desarrollo

Node 22.12+ (validado con 24.19) y npm:

```sh
cd /workspace/MinerIA1
npm ci
npm run dev
```

El servidor utiliza el puerto 5173. Las cifras solo se almacenan en localStorage al pulsar «Guardar mi simulación». El informe se descarga como texto UTF-8, con las entradas y las hipótesis. No hay autenticación, analítica ni transmisión de cifras.

## Validación

```sh
npm test
npm run build
# Con npm run dev activo y Chromium instalado:
npm run test:e2e
```

`CHROMIUM_PATH` permite seleccionar otro ejecutable para la comprobación de navegador. Las pruebas funcionales usan un contexto de navegador aislado y datos de ejemplo.

## Publicar la web

En Netlify, usa «Add new project» → «Import an existing project» → GitHub y selecciona `alejandrorepiso-dot/MinerIA1`, rama `main`. El archivo `netlify.toml` configura Node 24, el comando `npm run build` y la carpeta publicada `dist`. No hacen falta variables de entorno. Al terminar el despliegue, Netlify muestra la URL pública. Subir el código a GitHub no publica por sí solo una web.

Vercel también puede importar el repositorio como proyecto Vite, con `npm run build` y salida `dist`.

## Funcionalidad

- Cuestionario de seis pasos, campos condicionales y validación numérica.
- SL patrimonial, SL con actividad y filtro inicial de régimen especial de viviendas.
- IS, personal incremental, dividendos del socio residente, caja retenida y costes de entrada.
- Desglose presupuestado de aportación: IRPF, plusvalía, IVA/ITP/AJD, gastos y financiación.
- Guía de 18 temas y 11 fuentes oficiales. Investigación en [docs/INVESTIGACION.md](docs/INVESTIGACION.md).
- Guardado y recuperación local, informe, vista móvil y sensibilidad al coste laboral.

No es una declaración fiscal ni certificación de elegibilidad. La condición patrimonial se determina por hechos. Se comparan escenarios, no opciones fiscales libremente elegibles. Se presupone un solo socio persona física residente en territorio común, con mínimo personal consumido en otras rentas. Las cifras de 2026 se mantienen constantes en la proyección; no se aplica el 15 % de nuevas entidades ni la senda futura de tipos. Los costes de entrada son estimaciones externas; no se calcula automáticamente la tributación individual de una aportación. Véanse las demás hipótesis en la aplicación y en el dossier.

## Estructura

- `src/engine.ts`: cálculo puro, clasificación orientativa y validaciones.
- `src/engine.test.ts`: pruebas fiscales y de caja.
- `src/main.tsx`: cuestionario, resultados, guía y almacenamiento.
- `src/research.ts`: contenidos y referencias de la guía.
- `src/style.css`: diseño adaptable sin recursos de terceros.

Para actualizar normativa: revisar fuentes primarias, modificar motor y textos, ampliar pruebas de límites y ejecutar todas las comprobaciones. La aplicación no actualiza reglas automáticamente.
