# Validación de entrega

Fecha: **6 de noviembre de 2026**, zona del tester **America/Guatemala (UTC−06:00)**.
Los nombres de carpetas usan UTC (`Z`). Se ejecutó contra el sitio público real,
sin mocks, con datos de demostración obtenidos de Login. No se modificaron registros.

## Resultado final

Corrida limpia: `artifacts/2026-11-06T21-33-29-608Z-10862/`.
Inicio local: **15:33:29**. Duración total Playwright: **12,03 s**.

| Caso | Estado | Duración del caso |
| --- | --- | --- |
| AUTH-001 · Inicio de sesión válido | Aprobado | 4,584 s |
| AUTH-002 · Contraseña incorrecta | Aprobado | 4,430 s |
| AUTH-003 · Campos vacíos | Aprobado | 2,679 s |

**3 aprobados, 0 fallidos, 0 omitidos, 0 reintentos.** Código de pruebas `0`;
código de generación del reporte `0`. Cuatro validaciones funcionales, cada una
con una captura y un JSON esperado/observado. El primer caso valida también la
apertura del formulario en un paso separado.

- HTML formal autónomo: `artifacts/2026-11-06T21-33-29-608Z-10862/allure-report/index.html`.
- HTML nativo: `artifacts/2026-11-06T21-33-29-608Z-10862/playwright-report/index.html`.
- Pruebas de navegación y portabilidad: `report-verification.json` en esa carpeta.
- Capturas de la revisión visual: `allure-AUTH-00N-verified.png` y
  `playwright-AUTH-00N-verified.png`, junto a ese JSON.
- Resultado de máquina: `results.json`; códigos de salida: `run.json`.
- `artifacts/latest.json` apunta a esta corrida final.

## Fallo controlado comprobado

Corrida: `artifacts/2026-11-06T21-33-09-546Z-10482/`.
Se sustituyó temporalmente `toHaveCount(2)` por `toHaveCount(3)` en AUTH-003.

- El caso falló con **Expected: 3 / Received: 2** en el paso
  **Validar los dos campos requeridos**.
- `npm run test:case -- AUTH-003` devolvió **1** y Allure se generó con código **0**.
- Ambos reportes mostraron el error y la evidencia asociados al paso correcto.
- La captura mostró los dos mensajes reales `Required`; el JSON conservó el
  error de aserción y el observado leído de la página.
- Se copió solo el HTML Allure a una carpeta temporal y se abrió mediante `file://`
  en Chromium **sin red**. Se navegó al caso y se cargó su imagen embebida.
- Se conservó `trace.zip`; se comprobó que contiene **0 frames de screencast**,
  porque las capturas de pantalla de la traza están desactivadas. El DOM y la red
  siguen disponibles para diagnóstico. Solo las capturas del helper son evidencia.
- Se restauró `toHaveCount(2)` mediante un bloque `finally`, se compiló y se ejecutó
  después la suite limpia indicada arriba. No queda una expectativa incorrecta activa.

El HTML y los datos del fallo permanecen aislados de la corrida final, dentro de
su propia carpeta ignorada por Git.

Para reproducir: editar temporalmente esa expectativa en `tests/auth.spec.ts`,
ejecutar lo siguiente, verificar código 1 del primer comando y **restaurar a 2**
antes de la corrida limpia. Ejecutar cada línea por separado:

```sh
npm run test:case -- AUTH-003
npm run report:verify
```

Después de restaurar:

```sh
npm run typecheck
npm test
npm run report:verify
```

## Qué se comprobó en cada reportador

**Allure 3 Awesome:** agrupación por suite, caso con ID/nombre/estado/duración,
parámetros de navegador y ambiente, paso funcional y adjuntos debajo de ese paso.
Se revisó el árbol JSON de todos los pasos y se cargó la captura en la UI de cada
caso del reporte final. Se abrió también el JSON esperado/observado en la UI.
Se verificaron el error y la imagen del caso fallido en la UI.

La comprobación de portabilidad copia únicamente `index.html`, sin sus JSON,
adjuntos ni scripts de origen, a `os.tmpdir()`. Se abrió con Chromium sin acceso a
red; la imagen cargó desde una URL `blob:` con anchura natural positiva. Las
carpetas temporales concretas están en los archivos `report-verification.json`.

**HTML nativo Playwright:** se sirvió mediante `playwright show-report`; se abrió
cada caso, se expandió el paso funcional y se comprobaron sus nodos de adjuntos.
La captura enlazada respondió HTTP 200 como `image/png`. Para el fallo se comprobó
además el mensaje de aserción en la UI. El reporte conserva acciones técnicas y
metadatos del adaptador, por lo que es más detallado que el formal.

**Decisión de integración:** con Playwright 1.65.0 + allure-playwright 3.14.0,
`step.attach()` dejó los adjuntos como hermanos del paso funcional. Se detectó
inspeccionando los resultados reales. Se sustituyó por `allure.attachment()` dentro
de `test.step()`. Esta API genera adjuntos Playwright y Allure conserva su padre;
se verificó de nuevo con casos aprobados y fallidos. No se modificó el adaptador.

**Enmascaramiento:** la revisión visual del login confirmó el bloque de contraseña
pública y el campo de contraseña cubiertos por la máscara. La captura del dashboard
no contiene formulario de contraseña. Las trazas y los archivos de sesión no se
versionan; la traza todavía puede contener valores del DOM o de acciones.

## Comandos ejecutados

| Comando | Resultado |
| --- | --- |
| `node --version`, `npm --version` | Node 22.22.3; npm 10.9.8 |
| `npm install -D …`, después `npm ci` | Instalación inicial y reproducción desde lock completadas |
| `npx playwright install chromium`, `npm run browsers:install` | Chromium instalado y comprobado |
| `npm run typecheck` | Aprobado: configuración, POM, soporte, casos y plantilla |
| `npx playwright test --list` | Exactamente 3 casos; plantilla y borradores fuera del descubrimiento |
| `npm test` | Suite real aprobada; ambos reportes de la misma corrida |
| `npm run test:headed -- --grep AUTH-001` | AUTH-001 aprobado con navegador visible, aislado |
| `npm run test:case -- AUTH-002` | AUTH-002 aprobado, aislado |
| `npm run test:case -- AUTH-003` | AUTH-003 aprobado aislado; además fallo controlado con código 1 |
| `npm run report:formal` | Regenera el HTML sin repetir tests; usa `--clean` en la salida de esa corrida |
| `npm run report:local -- artifacts/2026-11-06T21-28-37-461Z-8274` | Servidor local abierto y navegado; detenido al acabar |
| `node scripts/verify-reports.mjs` / `npm run report:verify` | Árbol de evidencia, ambos reportes, portabilidad e imagen sin red comprobados |
| `node --check` sobre los scripts `.mjs` | Sintaxis aprobada |
| `npx playwright codegen --help` | Opciones del comando de grabación comprobadas |
| `codegraph init -i`, `codegraph index` | Índice inicializado por autorización del usuario y actualizado |

## Archivos entregados

- `package.json`, `package-lock.json`, `.nvmrc`, `tsconfig.json`: herramientas y versiones reproducibles.
- `playwright.config.ts`, `allurerc.mjs`: Chromium y ambos reportadores.
- `.env.example`, `.gitignore`: configuración pública sin credenciales y exclusiones.
- `.vscode/extensions.json`: recomendación de la extensión oficial Microsoft.
- `pages/login.page.ts`: localizadores y acciones compartidas de Login.
- `support/environment.ts`: URL, ambiente y credenciales desde variables de entorno.
- `support/test.ts`: fixture LoginPage y metadatos del caso.
- `support/functional-step.ts`: validación, evidencia, esperado/observado y conservación del error original.
- `support/prepare-run.ts`: limpieza de salidas conocidas, también si VS Code reutiliza configuración.
- `tests/auth.spec.ts`: los tres casos solicitados.
- `templates/caso.template.ts`: plantilla fuera del descubrimiento automático.
- `drafts/.gitkeep`: carpeta para borradores temporales ignorados.
- `scripts/run.mjs`: corridas aisladas, generación aun con fallo y conservación del código de salida.
- `scripts/report.mjs`, `scripts/open-report.mjs`: regenerar formal y abrir local.
- `scripts/verify-reports.mjs`: verificación técnica reproducible de adjuntos y reportes.
- `README.md`, `docs/manual-tester.md`, `docs/validacion.md`: arranque, operación y evidencia de validación.
- `artifacts/`: reportes y evidencia local; todo su contenido está excluido de Git.

El HTML de referencia preexistente se conservó sin modificar y quedó excluido de
Git para evitar incorporar sus datos al piloto. Se usaron su resumen, estados y
navegación de suite/caso/detalle como referencia de organización de Allure.

## Límites y pendientes

- **Windows:** los comandos están documentados, pero solo se ejecutaron en macOS.
  Repetir `npm ci`, `npm run browsers:install`, `npm test` y `npm run report:verify`
  en Windows para validarlo allí.
- **Grabación interactiva:** se documentaron **Record new**, **Record at cursor** y
  **Pick locator**, pero no se operó una sesión de VS Code ni se grabó manualmente
  un flujo. Para comprobarlo, instalar `ms-playwright.playwright`, seguir la sección
  3 del manual y ejecutar el caso refactorizado. Para la alternativa ejecutar
  `npm run record`; se verificaron las opciones de CLI, no la interacción grabada.
- **Sitio compartido:** disponibilidad, credenciales y contenido pueden cambiar.
  Los resultados reflejan las ejecuciones indicadas; no garantizan el estado futuro.
- **Captura imposible:** el helper conserva el error funcional si falla también la
  captura; esta rama se revisó en el código, pero no se simuló una caída de navegador.
  Un proceso terminado o una página cerrada pueden impedir cualquier imagen.
- **Dependencias:** `npm audit` informó seis hallazgos moderados transitivos de
  Allure (`glob`/`minimatch` y sus dependientes); cero altos y cero críticos en esa
  revisión. No se aplicaron cambios de versión incompatibles ni `audit fix --force`.
  Reproducir con `npm audit`; revisar actualizaciones compatibles antes de extender
  el piloto a un entorno productivo.
- **Azure DevOps:** queda fuera de este piloto, como se solicitó.
