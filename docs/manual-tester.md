# Manual del tester · Gestión SQA

## 1. Instalación desde cero

Este piloto valida el [formulario de registro de Automation Testing](https://demo.automationtesting.in/Register.html).
Usa datos ficticios. Los casos no crean cuentas ni envían formularios válidos.

### Requisitos

- Windows 11 o superior (también Windows Server 2019+), o macOS 14 Sonoma o superior.
- Node.js 22 actualizado, 24 o 26, npm y Visual Studio Code. En este piloto se usaron
  Node **22.22.3**, npm **10.9.8**, macOS **26.6.2** y Chromium incluido con Playwright.
- Allure 3.33.0 requiere Node >=22.18.0. Se fija Node 22.22.3 en `.nvmrc`.
- Acceso a npm, a las descargas de navegadores de Microsoft y al sitio demo.
  Allure 3 se ejecuta con Node; este proyecto no requiere Java ni Allure 2 global.

Instalar Node desde [nodejs.org](https://nodejs.org/). Abrir una terminal nueva:

```sh
node --version
npm --version
```

En VS Code abrir **File → Open Folder…** y seleccionar la carpeta del proyecto.
Abrir **Extensions** (`Ctrl+Shift+X` en Windows, `Cmd+Shift+X` en macOS), buscar
**Playwright Test for VSCode**, publicado por **Microsoft**, identificador
`ms-playwright.playwright`, y pulsar **Install**. La recomendación está en
`.vscode/extensions.json`. No ejecutar “Install Playwright” para regenerar el proyecto:
ya incluye configuración y pruebas.

En **Terminal → New Terminal**, situado en la raíz (donde está `package.json`):

```sh
npm ci
npm run browsers:install
```

`npm ci` instala exactamente `package-lock.json`. Si se cambia la versión de Playwright,
hay que volver a instalar Chromium. No usar `npm audit fix --force` automáticamente.

El sitio de registro está configurado por defecto y no requiere credenciales.
Para cambiar el origen o el nombre del ambiente, usa las variables
`REGISTRATION_BASE_URL` y `REGISTRATION_TEST_ENV` de `.env.example` en tu `.env` local.
`REGISTRATION_BASE_URL` debe contener solo el origen, sin `/Register.html`.
Las variables anteriores de OrangeHRM no afectan esta suite.

`.env` está excluido de Git. Usa datos ficticios en las grabaciones y en las pruebas.
La traza tiene capturas de pantalla desactivadas; conserva snapshots del DOM y red.
Trace Viewer puede incluir DOM, red y valores de acciones; sus archivos son locales
y están excluidos de Git, igual que todos los artefactos de ejecución.

## 2. Primera ejecución

Todos los casos, sin interfaz:

```sh
npm test
```

Navegador visible:

```sh
npm run test:headed
```

Un caso por ID (cada comando crea su propia corrida):

```sh
npm run test:case -- REG-001
npm run test:case -- REG-002
npm run test:case -- REG-003
```

Filtrar y mostrar navegador:

```sh
npm test -- --grep REG-001 --headed
```

El terminal imprime la carpeta completa de la corrida y los códigos de salida de
pruebas y reporte. Cero significa éxito. Si falla un test se genera igualmente el
reporte y se conserva el código de error. Si pasan los tests pero falla Allure, el
comando también termina con error. Revisar por separado los dos códigos.

`artifacts/latest.json` apunta a la última ejecución iniciada desde los scripts npm.
Cada carpeta usa fecha UTC, milisegundos y PID, evitando mezclar resultados.
No hay reintentos; cada caso recibe un contexto nuevo sin sesión compartida.

También se pueden ejecutar las pruebas desde el icono de **Testing** en VS Code
y el triángulo al lado del caso. Esas ejecuciones generan HTML local y resultados
Allure en una carpeta de `artifacts/`, pero no actualizan `latest.json` ni
generan automáticamente el HTML formal. Para una entrega usar `npm test`, o pasar
la carpeta concreta a `npm run report:formal -- artifacts/NOMBRE-DE-CORRIDA`.
Si VS Code reutiliza su configuración, `support/prepare-run.ts` limpia las salidas
conocidas antes de la siguiente ejecución. Los scripts npm conservan cada corrida
en una carpeta distinta.

## 3. Cómo grabar

### Camino principal: extensión oficial

1. En **Testing**, abrir el panel **PLAYWRIGHT**. Seleccionar el proyecto `chromium`.
2. Pulsar **Record new**. Se abre un navegador y se crea un borrador. Introducir la
   URL pública de registro y realizar el flujo. El grabador crea llamadas `goto`, `fill`
   y `click`; no decide por sí solo el resultado de negocio.
3. Detener la grabación y mover el borrador a `drafts/recording.spec.ts` para que no
   se ejecute junto con los casos definitivos. Si la extensión lo creó en `tests/`,
   moverlo antes de ejecutar la suite. `drafts/` no está en el descubrimiento.
4. Para ampliar un caso, abrir su archivo, colocar el cursor en el tramo nuevo y
   pulsar **Record at cursor**. Preparar en el navegador el estado necesario para
   ese tramo. Copiar las acciones nuevas al bloque `run` del paso correspondiente.
5. Usar **Pick locator** para confirmar que cada localizador identifica un solo
   elemento. En el formulario, los campos de nombre tienen placeholders; el campo
   de correo se identifica por `input[type="email"]`.
6. Reemplazar los datos grabados por ejemplos ficticios antes de copiar las
   acciones al caso definitivo. No versionar el borrador.

La extensión puede presentar estas opciones en inglés aunque VS Code esté en español.
No se ha automatizado la interacción con VS Code en esta entrega; ver el registro de validación.

### Alternativa: Codegen por terminal

```sh
npm run record
```

Es equivalente a:

```sh
npx playwright codegen --browser chromium --output drafts/recording.spec.ts https://demo.automationtesting.in/Register.html
```

Se abren el navegador y Playwright Inspector. Grabar, detener con **Record** y cerrar
las ventanas al terminar. Si se detiene con `Ctrl+C`, comprobar que el archivo quedó
guardado. El borrador es temporal y queda excluido de Git.

## 4. De la grabación a Allure

1. Grabar con **Record new** o **Record at cursor**.
2. Copiar `templates/caso.template.ts` a `tests/mi-caso.spec.ts`. Editar la suite
   en `test.describe` y el ID y nombre del caso en `test`. Conservar el import de
   `test` desde `../support/test.js`: mantiene los metadatos del reporte.
3. Pegar las acciones grabadas con `page` en `run`, dentro de `functionalStep`.
   Ajustar URL, localizadores y datos ficticios. La plantilla solo pide `{ page }`.
4. Editar `name` y `expected` para describir qué se valida. Añadir los
   `await expect(...)` dentro de `run`, después de las acciones. Ajustar
   `observe` para leer lo que muestra el sitio. Repetir `functionalStep` por
   cada validación que necesite su propia captura.
5. Ejecutar `npm run test:case -- REG-004` (usar el ID del caso nuevo).
   Abrir `allure-report/index.html` dentro de la carpeta de corrida que imprime
   el comando. También puedes localizarla con `artifacts/latest.json`.
   En Allure, abrir **suite → caso → paso → Evidencia funcional**.

### Antes: acciones de un borrador de registro

Fragmento representativo del flujo de REG-002 con datos ficticios:

```ts
await page.goto('https://demo.automationtesting.in/Register.html');
await page.locator('input[type="email"]').fill('correo-invalido');
await page.locator('input[type="email"]').fill('tester@example.test');
```

### Después: acciones y aserciones dentro de la plantilla

```ts
const email = page.locator('input[type="email"]');
await functionalStep({
  page,
  name: 'Validar el formato del correo',
  expected: 'El navegador distingue un correo inválido de uno válido.',
  run: async () => {
    await page.goto('/Register.html', { waitUntil: 'domcontentloaded' });
    await email.fill('correo-invalido');
    await expect(page.locator('input[type="email"]:invalid')).toBeVisible();
    await email.fill('tester@example.test');
    await expect(page.locator('input[type="email"]:valid')).toBeVisible();
  },
  observe: async () => `Correo final: ${await email.inputValue()}`,
});
```

`functionalStep` adjunta la captura automáticamente. El ejemplo completo está
en `tests/register.spec.ts`. El caso valida el formato local del campo; no verifica
la existencia de una dirección ni envía el formulario.

### Evidencias automáticas

`functionalStep` usa `test.step()`, ejecuta la validación, lee el observado y toma
**una captura** antes de devolver o relanzar el error. Si falla la validación, el
JSON también contiene el error original de aserción. Si falla la captura, conserva
el error original; si la validación pasó pero falta evidencia, el paso falla para
que la entrega incompleta sea visible.

Las capturas y el JSON **Resultado esperado y observado** se adjuntan usando la API
`allure.attachment()` dentro del `test.step` activo. Esta API también produce adjuntos
Playwright. En las versiones fijadas, `step.attach()` dejaba los adjuntos fuera del
paso en Allure; por eso se usa la API compatible y se verificó la jerarquía generada.
No agregar capturas manuales ni activar `screenshot: 'on'` además del helper.

Si un paso falla, el test se detiene y los pasos posteriores no aparecen ejecutados.
El helper necesita una página viva; un cierre explícito, caída del navegador o
agotamiento del timeout total puede impedir la imagen. En ese caso el resultado
registra el error de evidencia, sin sustituir el fallo funcional que ya existía.

## 5. Generar y revisar reportes

`npm test` produce en **la misma ejecución**:

| Archivo dentro de la corrida | Uso |
| --- | --- |
| `playwright-report/index.html` | Revisión local, pasos, errores y adjuntos |
| `allure-results/` | Datos de entrada del reporte formal |
| `allure-report/index.html` | Allure 3 Awesome autónomo para compartir |
| `results.json` | Resultado Playwright legible por herramientas |
| `test-results/` | Adjuntos y trazas de fallos |
| `run.json` | Códigos de salida y Node usado |

Para regenerar Allure sin volver a probar el sitio:

```sh
npm run report:formal
```

Para abrir el reporte local de la última corrida:

```sh
npm run report:local
```

Abrir la URL que imprime el comando; detenerlo con `Ctrl+C`. Para otra corrida:

```sh
npm run report:local -- artifacts/NOMBRE-DE-CORRIDA
npm run report:formal -- artifacts/NOMBRE-DE-CORRIDA
```

En Playwright elegir el caso por ID, expandir **Test Steps** y el paso funcional;
abrir **Evidencia funcional** y el JSON del resultado. El estado y duración aparecen
en el caso; el proyecto indica Chromium.

En Allure Awesome abrir el HTML, entrar en la lista de pruebas, expandir la suite
**Automation Testing | Registro**, elegir el caso y expandir el paso funcional. Dentro
están los adjuntos **Evidencia funcional** y **Resultado esperado y observado**.
El caso incluye ID, nombre, estado, duración, navegador y ambiente. El resumen
muestra totales y permite navegar al detalle. La referencia HTML entregada se usó
como guía de navegación y jerarquía; no se importaron sus casos ni sus datos.

Copiar **solo `allure-report/index.html`** a otra carpeta y abrirlo con doble clic.
No depende de `allure-results`, de los PNG originales ni de un servidor. Los otros
JSON que deja Allure junto al HTML no son necesarios para visualizarlo.
El HTML nativo de Playwright usa su carpeta completa y se sirve con `report:local`.

Para repetir la comprobación técnica de adjuntos y navegación (Chromium sin interfaz):

```sh
npm run report:verify
```

También admite `npm run report:verify -- artifacts/NOMBRE-DE-CORRIDA`. Deja
`report-verification.json` y capturas de la revisión en esa corrida. Copia el HTML
formal a una carpeta temporal y verifica la evidencia con la red desactivada.
Para una corrida fallida comprueba además que el mensaje del error sea visible.

Cuando un fallo necesite más contexto que la captura, usar el adjunto **trace** del
reporte local o ejecutar:

```sh
npx playwright show-trace artifacts/NOMBRE-DE-CORRIDA/test-results/CARPETA-DEL-CASO/trace.zip
```

`retain-on-failure` conserva la traza solo de fallos. Revisar la línea de tiempo,
DOM y red para distinguir respuesta funcional de caída del sitio. Los reportes de
corridas previas se conservan aislados: compartir la carpeta/HTML correcto, guiándose
por `latest.json` y el registro de validación. No se acumula historial entre corridas.

## 6. Solución de problemas

| Síntoma | Qué hacer |
| --- | --- |
| `Executable doesn't exist` | Ejecutar `npm run browsers:install` después de `npm ci`. Verificar acceso a las descargas y espacio disponible. |
| Abre el sitio incorrecto | Revisar `REGISTRATION_BASE_URL` en `.env` y abrir una terminal desde la raíz del proyecto. |
| El demo no carga, hay timeout, DNS o HTTP 5xx | Abrir la URL manualmente, revisar conexión y Trace Viewer. Registrar falla de entorno; no cambiar la expectativa de negocio para hacerla pasar. |
| Cambió el demo | Confirmar textos y controles en el formulario. Actualizar los localizadores y las aserciones afectadas, luego volver a ejecutar. |
| `strict mode violation` | Usar **Pick locator**, revisar coincidencias y restringir por rol, nombre o contenedor. No ocultar ambigüedad con `.first()` sin una razón funcional. |
| Captura ausente | Revisar el error del helper y el JSON del paso. Asegurar que la validación usa `functionalStep` y que nadie cerró `page` antes de capturar. Revisar permisos y timeout. |
| Captura aparece fuera del paso en Allure | Mantener la API `allure.attachment` del helper y las versiones del lock. No sustituirla por `step.attach` sin volver a comprobar ambos reportes. |
| No aparecen pruebas en VS Code | Abrir la raíz, instalar extensión Microsoft, seleccionar `playwright.config.ts` y `chromium`; comprobar `npx playwright test --list`. |
| Allure no se genera | Comprobar Node >=22.18 y `run.json`; ejecutar `npm run report:formal -- artifacts/NOMBRE-DE-CORRIDA`. No instalar Allure 2/Java para resolverlo. |
| Abre un reporte anterior | Consultar `artifacts/latest.json`. Las ejecuciones de VS Code no cambian ese puntero. |

Un **defecto funcional** es, por ejemplo, aceptar una contraseña incorrecta con el
sitio funcionando y datos confirmados. Una **falla de entorno** puede ser que no
carguen los recursos o que el demo restablezca datos; un **fallo del test** puede ser
un localizador obsoleto. El color rojo por sí solo no determina la causa. Conservar
error, captura y traza y registrar la clasificación después de investigar.

## Fuentes oficiales y compatibilidad

Consultadas al implementar; las versiones efectivas están en `package-lock.json`:

- [Instalación y sistemas compatibles de Playwright](https://playwright.dev/docs/intro).
- [Extensión oficial y grabación desde VS Code](https://playwright.dev/docs/getting-started-vscode).
- [Codegen](https://playwright.dev/docs/codegen).
- [Page Object Models](https://playwright.dev/docs/pom).
- [Integración Allure Playwright y API de pasos/adjuntos](https://allurereport.org/docs/playwright-reference/).
- [Configuración de Allure 3](https://allurereport.org/docs/v3/configure/).
- [Opciones oficiales de Awesome, incluido singleFile](https://github.com/allure-framework/allure3/blob/main/packages/plugin-awesome/README.md).

Playwright 1.65.0, adaptador Allure Playwright 3.14.0 y Allure/Awesome 3.33.0
se instalaron y ejecutaron juntos. Para reproducir la entrega usar `npm ci`.
La validación de Windows y el uso interactivo de la extensión quedan indicados
por separado en `docs/validacion.md`.
