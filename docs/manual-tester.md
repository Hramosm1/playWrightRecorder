# Manual del tester · Gestión SQA

## 1. Instalación desde cero

Este piloto prueba únicamente la autenticación del [demo OrangeHRM](https://opensource-demo.orangehrmlive.com/web/index.php/auth/login).
No usar cuentas reales ni modificar registros del sitio compartido.

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

Copiar la configuración en macOS:

```sh
cp .env.example .env
```

O en Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Abrir la URL de OrangeHRM en el navegador. Debajo del título **Login** se muestran
los valores públicos **Username : …** y **Password : …**. Copiarlos a
`DEMO_USERNAME` y `DEMO_PASSWORD` en `.env`. Mantener `BASE_URL` como el origen
`https://opensource-demo.orangehrmlive.com`, sin la ruta de login. `TEST_ENV` es el
nombre legible del ambiente que aparecerá en el reporte. No copiar datos del HTML de referencia.

`.env` está excluido de Git; `.env.example` no contiene las credenciales.
No compartir sesiones guardadas, trazas ni borradores con contraseñas. Las capturas
del helper enmascaran el campo de contraseña y el texto público `Password : …`.
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
npm run test:case -- AUTH-001
npm run test:case -- AUTH-002
npm run test:case -- AUTH-003
```

Filtrar y mostrar navegador:

```sh
npm test -- --grep AUTH-001 --headed
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
   URL pública de Login y realizar el flujo. El grabador crea llamadas `goto`, `fill`
   y `click`; no decide por sí solo el resultado de negocio.
3. Detener la grabación y mover el borrador a `drafts/recording.spec.ts` para que no
   se ejecute junto con los casos definitivos. Si la extensión lo creó en `tests/`,
   moverlo antes de ejecutar la suite. `drafts/` no está en el descubrimiento.
4. Para ampliar un caso, abrir su archivo, colocar el cursor en el tramo nuevo y
   pulsar **Record at cursor**. Preparar en el navegador el estado necesario para
   ese tramo. Grabar solo las acciones que aún no tiene el POM.
5. Pulsar **Pick locator** para inspeccionar un elemento en el navegador y copiar
   su localizador. Preferir `getByRole`, `getByPlaceholder` y texto estable.
   Comprobar que identifica exactamente un elemento. En este demo las etiquetas
   Username/Password no tienen asociación accesible al input: usar sus placeholders.
6. Reemplazar datos escritos durante la grabación por `demoCredentials()` y revisar
   el borrador antes de copiarlo al caso definitivo. No versionar el borrador.

La extensión puede presentar estas opciones en inglés aunque VS Code esté en español.
No se ha automatizado la interacción con VS Code en esta entrega; ver el registro de validación.

### Alternativa: Codegen por terminal

```sh
npm run record
```

Es equivalente a:

```sh
npx playwright codegen --browser chromium --output drafts/recording.spec.ts https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
```

Se abren el navegador y Playwright Inspector. Grabar, detener con **Record** y cerrar
las ventanas al terminar. Si se detiene con `Ctrl+C`, comprobar que el archivo quedó
guardado. El borrador es temporal y queda excluido de Git.

## 4. Plantilla, POM y comprobaciones

### Operación habitual

1. Duplicar `templates/caso.template.ts` dentro de `tests/` con nombre terminado en
   `.spec.ts`, por ejemplo `tests/login-adicional.spec.ts`. No modificar la plantilla
   para habilitarla: queda fuera de `testDir` y no coincide con `testMatch`.
2. Cambiar `AUTH-004`, nombre y suite. Usar un ID único. La suite se declara con
   `test.describe`; los metadatos ID, navegador y ambiente se agregan desde `support/test.ts`.
3. Reutilizar la fixture `login`, que entrega un `LoginPage` nuevo por test. Los tres
   casos de `tests/auth.spec.ts` usan ese mismo objeto de página.
4. Grabar solo lo nuevo. Si es una acción reutilizable de Login, incorporar su
   localizador y método en `pages/login.page.ts`. Evitar un método por cada clic.
5. Mantener las comprobaciones de negocio en el test, dentro de `functionalStep`.
   Usar `await expect(locator).toBeVisible()`, `toHaveText`, `toHaveURL`, etc.
   No usar `waitForTimeout` ni pausas fijas.
6. Declarar un paso por validación funcional con nombre, `expected`, `run` y
   `observe`. `run` incluye las acciones y aserciones. `observe` lee el estado real
   de la aplicación y no debe devolver una copia del resultado esperado.
7. Ejecutar el caso aislado, revisar ambos reportes y ejecutar luego la suite.

No se creó `DashboardPage`: aquí solo se valida su URL y encabezado; no hay acciones
reutilizables del dashboard que justifiquen otro objeto.

### Antes: borrador de Codegen de OrangeHRM

Fragmento representativo de la salida usando los localizadores inspeccionados; los
valores se sustituyen por variables inmediatamente después de grabar:

```ts
await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
await page.getByPlaceholder('Username').fill(username);
await page.getByPlaceholder('Password').fill(password);
await page.getByRole('button', { name: 'Login', exact: true }).click();
```

### Después: test mantenible

```ts
const { username, password } = demoCredentials();
await functionalStep({
  page,
  name: 'Autenticarse y validar el dashboard',
  expected: 'URL /dashboard/index y encabezado Dashboard visible.',
  run: async () => {
    await login.open();
    await login.signIn(username, password);
    await expect(page).toHaveURL(/\/dashboard\/index(?:[?#].*)?$/);
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  },
  observe: async () => `URL: ${page.url()}; encabezados: ${(await page.getByRole('heading').allTextContents()).join(', ')}`,
});
```

Importar `demoCredentials` de `../support/environment.js`, `functionalStep` de
`../support/functional-step.js`, y `test, expect` de `../support/test.js`.
Los sufijos `.js` son intencionales para resolución NodeNext en TypeScript.

La línea `goto` se sustituye por `login.open()`. Las tres líneas de `fill`, `fill`,
`click` se sustituyen por `login.signIn()`, ya implementado. Sus localizadores están
centralizados en `LoginPage`; solo agregar allí una acción si el tramo nuevo la
necesita. La aserción del dashboard permanece en el test. No copiar la contraseña
en el código, nombres de pasos ni resultados observados.

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
**OrangeHRM | Autenticación**, elegir el caso y expandir el paso funcional. Dentro
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
Para la corrida de fallo controlado comprueba además el error `Expected: 3 / Received: 2`.

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
| Faltan credenciales | Completar `.env` con los valores públicos actuales de Login y abrir una terminal desde la raíz del proyecto. |
| El demo no carga, hay timeout, DNS o HTTP 5xx | Abrir la URL manualmente, revisar conexión y Trace Viewer. Registrar falla de entorno; no cambiar la expectativa de negocio para hacerla pasar. |
| Cambió el demo | Confirmar textos y credenciales en la aplicación. Actualizar los localizadores compartidos en `LoginPage` y las expectativas afectadas, luego volver a ejecutar. |
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
