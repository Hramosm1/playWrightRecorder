# Gestión SQA · piloto web

Automation Testing público, TypeScript, Playwright Test, Chromium y Allure Report 3 Awesome.
Tres casos independientes del formulario de registro: campos requeridos, formato de correo y selección de pasatiempos. No se crean cuentas. Azure DevOps queda para una fase posterior.

## Arranque rápido

Node usado: **22.22.3**, npm **10.9.8**. Desde la raíz del proyecto:

```sh
npm ci
npm run browsers:install
```

El [sitio de registro](https://demo.automationtesting.in/Register.html) está configurado por defecto y no requiere credenciales.

```sh
npm test
npm run test:headed
npm run test:case -- REG-002
npm run report:formal
npm run report:local
```

Cada `npm test` genera ambos reportes, incluso con fallos. `artifacts/latest.json` indica
la última carpeta: `playwright-report/index.html` para revisión local y
`allure-report/index.html` para compartir como HTML autónomo.

- [Manual del tester](docs/manual-tester.md): instalación, grabación, plantilla y reporte.
- [Validación histórica del piloto OrangeHRM](docs/validacion.md): resultados reales, fallo controlado y limitaciones.
- `templates/caso.template.ts`: copiar a `tests/nombre.spec.ts` para habilitar un caso nuevo.
- `npm run typecheck`: validación estática completa del piloto.
- `npm run report:verify`: comprueba adjuntos y abre ambos reportes con Chromium;
  copia solo el HTML formal a una carpeta temporal y carga su imagen sin red.

La operación habitual es grabar, pegar las acciones con `page` en la plantilla,
añadir aserciones dentro de `functionalStep` y ejecutar el caso. El helper adjunta
la captura al paso en Allure. REG-002 muestra este flujo sin Page Objects.
