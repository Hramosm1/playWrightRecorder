# Gestión SQA · piloto web

OrangeHRM público, TypeScript, Playwright Test, Chromium y Allure Report 3 Awesome.
Tres casos independientes de autenticación, sin modificar registros. Azure DevOps queda para una fase posterior.

## Arranque rápido

Node usado: **22.22.3**, npm **10.9.8**. Desde la raíz del proyecto:

```sh
npm ci
npm run browsers:install
```

Copiar `.env.example` a `.env` y completar los dos valores públicos que aparecen en Login.

```sh
npm test
npm run test:headed
npm run test:case -- AUTH-002
npm run report:formal
npm run report:local
```

Cada `npm test` genera ambos reportes, incluso con fallos. `artifacts/latest.json` indica
la última carpeta: `playwright-report/index.html` para revisión local y
`allure-report/index.html` para compartir como HTML autónomo.

- [Manual del tester](docs/manual-tester.md): instalación, grabación, plantilla, POM y reporte.
- [Validación de entrega](docs/validacion.md): resultados reales, fallo controlado y limitaciones.
- `templates/caso.template.ts`: copiar a `tests/nombre.spec.ts` para habilitar un caso nuevo.
- `npm run typecheck`: validación estática completa del piloto.
- `npm run report:verify`: comprueba adjuntos y abre ambos reportes con Chromium;
  copia solo el HTML formal a una carpeta temporal y carga su imagen sin red.

La operación habitual es duplicar la plantilla, reutilizar acciones, grabar solo el tramo
nuevo y escribir las comprobaciones. Las capturas se toman automáticamente por validación
funcional mediante `support/functional-step.ts`.
