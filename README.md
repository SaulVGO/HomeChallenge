# TakeHomeChallenge

[![Playwright Tests](https://github.com/SaulVGO/HomeChallenge/actions/workflows/test.yml/badge.svg)](https://github.com/SaulVGO/HomeChallenge/actions/workflows/test.yml)

Pruebas end-to-end con Playwright para validar la búsqueda, el filtrado y el ordenamiento de productos en Liverpool.

## Requisitos

Antes de comenzar, instala:

- [Node.js LTS](https://nodejs.org/). npm se instala automáticamente junto con Node.js.
- Google Chrome, porque el proyecto está configurado para ejecutar las pruebas en Chrome.

Puedes comprobar la instalación desde PowerShell, Terminal o Command Prompt:

```bash
node --version
npm --version
```

## Instalación

1. Descarga el proyecto y abre una terminal en su carpeta raíz, la carpeta que contiene `package.json`.
2. Instala las dependencias del proyecto:

```bash
npm ci
```

3. Instala el navegador que utiliza Playwright:

```bash
npx playwright install chromium
```

En un entorno Linux de integración continua, utiliza este comando para instalar también las dependencias del sistema:

```bash
npx playwright install --with-deps chromium
```

## Ejecutar las pruebas localmente

Todos los comandos siguientes deben ejecutarse desde la carpeta raíz del proyecto.

### Controlar el modo desde la configuración

El archivo [`playwright.config.js`](playwright.config.js) contiene la propiedad `headless` dentro de `use`. El comando `npx playwright test` respeta el valor configurado:

```javascript
use: {
	headless: true
}
```

- `headless: true`: ejecuta las pruebas sin mostrar la ventana del navegador.
- `headless: false`: ejecuta las pruebas mostrando la ventana del navegador.

Para cambiar el modo, modifica el valor de `headless` en `playwright.config.js` y ejecuta el mismo comando.

### Headless: navegador oculto

Con `headless: true`, las pruebas se ejecutan sin abrir una ventana del navegador, por lo que este modo es útil para ejecuciones rápidas o automatizadas:

```bash
npx playwright test
```

También puedes ejecutar únicamente la prueba principal:

```bash
npx playwright test tests/test-1.spec.js
```

### Headed: navegador visible

Con `headless: false`, el comando anterior abre la ventana de Chrome mientras se ejecutan las pruebas:

```bash
npx playwright test
```

Como alternativa puntual, puedes forzar el modo visible sin modificar el archivo de configuración usando `--headed`:

```bash
npx playwright test --headed
```

La ventana de Chrome se abrirá mientras se ejecutan las pruebas.

## Reporte HTML

Después de ejecutar las pruebas, abre el reporte detallado con:

```bash
npx playwright show-report
```

## GitHub Actions

El workflow [`Playwright Tests`](.github/workflows/test.yml) ejecuta las pruebas automáticamente en cada push a `main` o `master`, y en pull requests dirigidos a esas ramas. La ejecución utiliza Linux, instala Chromium y ejecuta las pruebas en modo headless.

Al finalizar, GitHub Actions guarda el reporte de Playwright como artefacto durante 30 días.

## Ejecución exitosa

Consulta una [corrida exitosa de Playwright Tests en GitHub Actions](https://github.com/SaulVGO/HomeChallenge/actions/runs/35049462031).