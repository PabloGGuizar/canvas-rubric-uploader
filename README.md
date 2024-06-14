# Guía de Usuario para Canvas Rubric Uploader

## Descripción

Canvas Rubric Uploader es una herramienta que te permite subir rúbricas a Canvas LMS usando un archivo CSV. Es fácil de usar y no requiere conocimientos técnicos avanzados.

## Requisitos

- Navegador web (Chrome, Firefox, Edge, Safari).
- Cuenta en Canvas LMS con permisos para gestionar rúbricas.
- Archivo CSV con la rúbrica a cargar.

## Pasos para Configurar y Usar Canvas Rubric Uploader

### Paso 1: Instalar Tampermonkey

**Tampermonkey** es una extensión de navegador que permite ejecutar scripts personalizados en sitios web. Aquí te explicamos cómo instalarla:

1. **Google Chrome:**
   - Abre Chrome y visita [Tampermonkey en Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).
   - Haz clic en "Añadir a Chrome" y luego en "Agregar extensión".

2. **Mozilla Firefox:**
   - Abre Firefox y visita [Tampermonkey en Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/).
   - Haz clic en "Añadir a Firefox" y sigue las instrucciones.

3. **Microsoft Edge:**
   - Abre Edge y visita [Tampermonkey en Microsoft Store](https://www.microsoft.com/en-us/p/tampermonkey/9nblggh5162s).
   - Haz clic en "Obtener" y sigue las instrucciones.

4. **Safari:**
   - Abre Safari y visita [Tampermonkey](https://www.tampermonkey.net/?browser=safari).
   - Sigue las instrucciones para instalar la extensión.

### Paso 2: Añadir el Script Canvas Rubric Uploader

1. **Abrir Tampermonkey:**
   - Haz clic en el icono de Tampermonkey en la barra de herramientas del navegador.
   - Selecciona "Dashboard" para abrir el panel de control de Tampermonkey.

2. **Crear un Nuevo Script:**
   - Haz clic en el botón con el signo "+" para crear un nuevo script.
   - Borra cualquier texto en el editor que se abre.

3. **Copiar y Pegar el Código del Script:**
   - Pega el código del script en el editor de Tampermonkey.
   - Guarda el script haciendo clic en "File" > "Save".

### Paso 3: Obtener tu Token de Acceso de Canvas

1. **Iniciar sesión en Canvas:** Inicia sesión en tu cuenta de Canvas.
2. **Ir a Configuración:** Navega a la configuración de tu cuenta.
3. **Generar un nuevo token de acceso:** Busca la sección de "Acceso API" o "Tokens de acceso" y genera un nuevo token. Copia este token.

### Paso 4: Preparar el Archivo CSV

El archivo CSV debe tener el siguiente formato:

```csv
criterion,criterion_description,rating_description_1,rating_points_1,rating_description_2,rating_points_2,rating_description_3,rating_points_3
Criterio 1,Claridad del contenido,Excelente,3.0,Bueno,2.0,Regular,1.0
Criterio 2,Organización del texto,Excelente,3.0,Bueno,2.0,Regular,1.0
Criterio 3,Gramática y ortografía,Excelente,3.0,Bueno,2.0,Regular,1.0
Criterio 4,Estilo y tono,Excelente,3.0,Bueno,2.0,Regular,1.0
Criterio 5,Originalidad,Excelente,3.0,Bueno,2.0,Regular,1.0
```

Guarda este contenido en un archivo con la extensión .csv, por ejemplo, rubrica_ejemplo.csv.

### Paso 5: Subir la Rúbrica a Canvas

1. **Abrir la sección de Rúbricas en Canvas:** Navega a la sección de Rúbricas en tu curso de Canvas.
2. **Hacer clic en el botón "Subir Rúbrica":** Debería aparecer un formulario.
3. **Completar el formulario:**
  - Introduce el título de la rúbrica.
  - Selecciona el archivo CSV que contiene la rúbrica.
  - Pega tu token de acceso en el campo correspondiente.
4. **Hacer clic en "Subir":** El script subirá la rúbrica a Canvas.
5. **Administra tu token:** Selecciona si deseas guardar o borrar tu token del equipo.

### Nota de Seguridad
El token de acceso se almacenará en el almacenamiento local de tu navegador. Asegúrate de que tu entorno sea seguro y evita compartir este token con terceros.
