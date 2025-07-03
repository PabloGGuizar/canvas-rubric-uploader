// ==UserScript==
// @name         Canvas Rubric Uploader (Versión Final)
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Sube rúbricas a Canvas LMS desde un archivo CSV sin necesidad de un token de acceso manual y sin sobrescribir las existentes.
// @author       Pablo Gómez, ChatGPT, Gemini
// @match        *://*.instructure.com/courses/*/rubrics
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Accede a la variable global ENV de Canvas para obtener información de forma segura.
    const ENV = (typeof unsafeWindow !== 'undefined') ? unsafeWindow.ENV : window.ENV;

    /**
     * Obtiene el token CSRF de Canvas utilizando múltiples métodos para mayor robustez.
     * @returns {string|null} El token CSRF o null si no se encuentra.
     */
    function getCsrfToken() {
        if (ENV && ENV.CSRF_TOKEN) return ENV.CSRF_TOKEN;
        const cookieValue = document.cookie.split('; ').find(row => row.startsWith('_csrf_token='));
        if (cookieValue) return decodeURIComponent(cookieValue.split('=')[1]);
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) return metaTag.getAttribute('content');
        return null;
    }

    /**
     * Añade un botón a la página de Rúbricas para iniciar el proceso de subida.
     */
    const addButton = document.querySelector('a.add_rubric_link');
    if (addButton) {
        const button = document.createElement('a');
        button.innerText = 'Subir Rúbrica desde CSV';
        button.classList.add('btn', 'button-sidebar-wide');
        button.style.marginTop = '10px';
        addButton.insertAdjacentElement('afterend', button);
        button.addEventListener('click', showUploadModal);
    }

    /**
     * Muestra un modal para que el usuario introduzca el título y seleccione el archivo CSV.
     */
    function showUploadModal() {
        if (document.getElementById('rubricUploadModal')) return;

        const modal = document.createElement('div');
        modal.id = 'rubricUploadModal';
        Object.assign(modal.style, {
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            padding: '25px', backgroundColor: '#fff', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            zIndex: 1001, borderRadius: '8px', width: 'clamp(300px, 50%, 500px)'
        });

        modal.innerHTML = `
            <h2 style="margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 10px;">Subir Rúbrica a Canvas</h2>
            <form id="rubricForm">
                <div style="margin-bottom: 15px;">
                    <label for="rubricTitle" style="display: block; margin-bottom: 5px; font-weight: bold;">Título de la rúbrica:</label>
                    <input id="rubricTitle" type="text" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="rubricFile" style="display: block; margin-bottom: 5px; font-weight: bold;">Archivo de la rúbrica (.csv):</label>
                    <input id="rubricFile" type="file" accept=".csv" required style="width: 100%;">
                </div>
                <div id="notificationArea" style="margin-top: 15px; padding: 10px; border-radius: 4px; display: none; color: white; word-wrap: break-word;"></div>
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button type="button" id="closeModal" class="btn">Cerrar</button>
                    <button type="submit" id="submitRubric" class="btn btn-primary">Subir</button>
                </div>
            </form>
        `;
        document.body.appendChild(modal);

        document.getElementById('closeModal').addEventListener('click', () => modal.remove());
        document.getElementById('rubricForm').addEventListener('submit', handleFormSubmit);
    }

    /**
     * Muestra una notificación dentro del modal.
     * @param {string} message - El mensaje a mostrar.
     * @param {('success'|'error')} type - El tipo de notificación.
     */
    function showNotification(message, type) {
        const notificationArea = document.getElementById('notificationArea');
        if (!notificationArea) return;
        notificationArea.style.display = 'block';
        notificationArea.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
        notificationArea.textContent = message;
    }

    /**
     * Maneja el evento de envío del formulario.
     * @param {Event} event - El evento de envío del formulario.
     */
    async function handleFormSubmit(event) {
        event.preventDefault();
        const submitButton = document.getElementById('submitRubric');
        const closeButton = document.getElementById('closeModal');
        const formInputs = document.querySelectorAll('#rubricForm input, #rubricForm button');

        formInputs.forEach(input => input.disabled = true);
        submitButton.innerText = 'Subiendo...';

        const rubricTitle = document.getElementById('rubricTitle').value;
        const rubricFile = document.getElementById('rubricFile').files[0];
        const courseId = ENV.COURSE_ID || window.location.pathname.split('/')[2];

        const fileReader = new FileReader();
        fileReader.onload = async function(e) {
            const csvContent = e.target.result;
            try {
                const rubricData = parseCSV(csvContent);

                if (Object.keys(rubricData).length === 0) {
                    throw new Error("No se encontraron criterios válidos en el archivo CSV. Revisa que el archivo no esté vacío y que el formato sea correcto.");
                }

                await createRubricInCanvas(courseId, rubricTitle, rubricData);

                // *** CAMBIO CLAVE: Recarga automática después de un mensaje de éxito ***
                showNotification('¡Éxito! La rúbrica se ha subido. La página se actualizará en 2 segundos...', 'success');
                setTimeout(() => {
                    location.reload();
                }, 2000); // 2 segundos de espera

            } catch (error) {
                showNotification(`Error: ${error.message}. Si el problema persiste, abre la consola (F12), copia el texto del payload y el error en rojo, y compártelo.`, 'error');
                formInputs.forEach(input => input.disabled = false);
                submitButton.innerText = 'Intentar de Nuevo';
            }
        };
        fileReader.readAsText(rubricFile);
    }

    /**
     * Parsea el contenido de un archivo CSV para construir el objeto de la rúbrica.
     * @param {string} csvContent - El contenido del archivo CSV.
     * @returns {Object} - Un objeto que representa los criterios de la rúbrica.
     */
    function parseCSV(csvContent) {
        const lines = csvContent.split('\n').filter(line => line.trim() !== '');
        const criteria = {};

        lines.slice(1).forEach((line) => {
            const parts = parseCSVLine(line);
            if (parts.length < 2) return;

            const [criterion, criterion_description] = parts.splice(0, 2);
            const ratings = {};

            for (let i = 0; i < parts.length; i += 2) {
                const rating_description = parts[i];
                const rating_points_str = parts[i + 1];

                if (rating_description && rating_points_str) {
                    const rating_points = parseFloat(rating_points_str);
                    if (!isNaN(rating_points)) {
                        const rating_id = `r_${Math.random().toString(36).substring(2, 9)}`;
                        ratings[rating_id] = {
                            description: rating_description,
                            points: rating_points
                        };
                    }
                }
            }

            if (Object.keys(ratings).length > 0) {
                const criterion_id = `c_${Math.random().toString(36).substring(2, 9)}`;
                criteria[criterion_id] = {
                    description: criterion,
                    long_description: criterion_description,
                    points: Object.values(ratings).reduce((max, r) => Math.max(max, r.points), 0),
                    ratings: ratings
                };
            }
        });
        return criteria;
    }

    /**
     * Parsea una sola línea de CSV, manejando comillas.
     * @param {string} line - La línea del CSV a parsear.
     * @returns {string[]} - Un array de los campos de la línea.
     */
    function parseCSVLine(line) {
        const result = []; let insideQuotes = false; let value = '';
        for (const char of line) {
            if (char === '"') insideQuotes = !insideQuotes;
            else if (char === ',' && !insideQuotes) { result.push(value.trim()); value = ''; }
            else value += char;
        }
        result.push(value.trim());
        return result;
    }

    /**
     * Envía la petición a la API de Canvas para crear la rúbrica.
     * @param {string} courseId - El ID del curso.
     * @param {string} rubricTitle - El título de la rúbrica.
     * @param {Object} criteria - El objeto con los datos de los criterios.
     */
    async function createRubricInCanvas(courseId, rubricTitle, criteria) {
        const csrfToken = getCsrfToken();
        if (!csrfToken) {
            throw new Error('No se pudo obtener el token de autenticación. Asegúrate de estar en una página de Canvas.');
        }

        const url = `/api/v1/courses/${courseId}/rubrics`;

        const rubricPayload = {
            rubric: {
                title: rubricTitle,
                criteria: criteria,
                free_form_criterion_comments: false
            },
            rubric_association: {
                association_id: courseId,
                association_type: 'Course',
                purpose: 'bookmark'
            }
        };

        console.log("Enviando el siguiente payload a Canvas API:", JSON.stringify(rubricPayload, null, 2));

        try {
            await axios.post(url, rubricPayload, {
                headers: { 'X-CSRF-Token': csrfToken, 'Content-Type': 'application/json', 'Accept': 'application/json' }
            });
        } catch (error) {
            console.error('Error en la petición a la API de Canvas:', error.response || error);
            const errorMessage = error.response?.data?.errors?.[0]?.message || 'Ocurrió un error desconocido durante la subida.';
            throw new Error(errorMessage);
        }
    }
})();
