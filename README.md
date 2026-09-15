# TakeHomeChallenge

[![Playwright Tests](https://github.com/SaulVGO/HomeChallenge/actions/workflows/test.yml/badge.svg)](https://github.com/SaulVGO/HomeChallenge/actions/workflows/test.yml)

Pruebas end-to-end con Playwright para la búsqueda y el filtrado de productos en Liverpool.

## Requisitos

- Node.js LTS
- npm

## Instalación

Desde la raíz del proyecto:

```bash
npm ci
npx playwright install
```

En Linux CI, instala también las dependencias del sistema:

```bash
npx playwright install --with-deps
```

## Ejecución local

El modo predeterminado es **headless** y ejecuta las pruebas en Chrome:

```bash
npx playwright test
```

Para ejecutar con el navegador visible (**headed**):

```bash
npx playwright test --headed
```

También puedes activar el modo visible mediante la variable de entorno:

PowerShell:

```powershell
$env:HEADED="true"; npx playwright test
```

Command Prompt:

```bat
set HEADED=true && npx playwright test
```

## Reporte HTML

Después de una ejecución, abre el reporte con:

```bash
npx playwright show-report
```

## GitHub Actions

El workflow [`Playwright Tests`](.github/workflows/test.yml) se ejecuta en cada push a `main` o `master` y en pull requests dirigidos a esas ramas.

Sustituye `OWNER/REPOSITORY` en el badge superior por el propietario y nombre reales del repositorio para mostrar su estado en GitHub.

## Publicar en GitHub

1. Crea un repositorio vacío en GitHub con el nombre que prefieras. No inicialices README, `.gitignore` ni licencia, porque esos archivos ya existen localmente.
2. Configura el remoto y publica la rama actual:

```bash
git remote add origin https://github.com/SaulVGO/HomeChallenge.git
git add .
git commit -m "Initial project setup"
git branch -M main
git push -u origin main
```

3. Cambia `OWNER/REPOSITORY` en el badge por los datos reales del repositorio y publica ese cambio:

```bash
git add README.md
git commit -m "Update GitHub Actions badge"
git push
```

Después del primer push, GitHub Actions ejecutará automáticamente el workflow y podrás consultar el resultado en la pestaña **Actions**.