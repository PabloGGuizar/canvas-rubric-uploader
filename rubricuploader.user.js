// ==UserScript==
// @name         Canvas Rubric Uploader
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Subir rúbricas a Canvas LMS con opciones para no guardar o borrar el token de acceso
// @author       Pablo Gómez, ChatGPT
// @match        *://*.instructure.com/courses/*/rubrics
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Añadir un botón a la página de Rúbricas
    const addButton = document.querySelector('a.add_rubric_link');
    if (addButton) {
        const button = document.createElement('a');
        button.innerText = 'Subir Rúbrica';
        button.classList.add('btn', 'button-sidebar-wide');
        button.style.marginTop = '10px';

        addButton.insertAdjacentElement('afterend', button);

        button.addEventListener('click', () => {
            // Crear un formulario modal para subir la rúbrica
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.padding = '20px';
            modal.style.backgroundColor = '#fff';
            modal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
            modal.style.zIndex = 1001;

            const storedToken = localStorage.getItem('canvasAccessToken') || '';

            modal.innerHTML = `
                <h2>Subir Rúbrica a Canvas</h2>
                <form id="rubricForm">
                    <div>
                        <label for="rubricTitle">Título de la rúbrica:</label>
                        <input id="rubricTitle" type="text" required>
                    </div>
                    <div>
                        <label for="rubricFile">Archivo de la rúbrica (.csv):</label>
                        <input id="rubricFile" type="file" accept=".csv" required>
                    </div>
                    <div>
                        <label for="accessToken">Token de acceso:</label>
                        <input id="accessToken" type="password" value="${storedToken}" required>
                    </div>
                    <div>
                        <input type="checkbox" id="saveToken" ${storedToken ? 'checked' : ''}>
                        <label for="saveToken">Guardar token de acceso</label>
                    </div>
                    <div style="color: red; font-size: 12px; margin-top: 10px;">
                        <strong>Advertencia:</strong> El token de acceso se almacenará en el almacenamiento local de tu navegador. 
                        Asegúrate de que tu entorno sea seguro y evita compartir este token con terceros.
                    </div>
                    <button type="submit">Subir</button>
                    <button type="button" id="closeModal">Cerrar</button>
                    <button type="button" id="clearToken" style="margin-left: 10px;">Borrar token</button>
                </form>
            `;
            document.body.appendChild(modal);

            document.getElementById('closeModal').addEventListener('click', () => {
                modal.remove();
            });

            document.getElementById('clearToken').addEventListener('click', () => {
                localStorage.removeItem('canvasAccessToken');
                document.getElementById('accessToken').value = '';
                document.getElementById('saveToken').checked = false;
            });

            document.getElementById('rubricForm').addEventListener('submit', async function(event) {
                event.preventDefault();

                // Obtener los valores del formulario
                const rubricTitle = document.getElementById('rubricTitle').value;
                const rubricFile = document.getElementById('rubricFile').files[0];
                const accessToken = document.getElementById('accessToken').value;
                const saveToken = document.getElementById('saveToken').checked;

                // Guardar o eliminar el token en localStorage
                if (saveToken) {
                    localStorage.setItem('canvasAccessToken', accessToken);
                } else {
                    localStorage.removeItem('canvasAccessToken');
                }

                // Obtener el ID del curso desde la URL
                const courseId = window.location.pathname.split('/')[2];

                // Leer el archivo CSV
                const fileReader = new FileReader();
                fileReader.onload = async function(e) {
                    const csvContent = e.target.result;

                    // Parsear el contenido del CSV
                    const rubricData = parseCSV(csvContent);

                    // Crear la rúbrica en Canvas
                    await createRubricInCanvas(courseId, rubricTitle, rubricData, accessToken);
                };
                fileReader.readAsText(rubricFile);
            });
        });
    }

    function parseCSV(csvContent) {
        const lines = csvContent.split('\n');
        const criteria = {};

        lines.forEach((line, index) => {
            if (index === 0 || line.trim() === '') return; // Saltar la primera línea (cabecera) y las líneas vacías

            const parts = parseCSVLine(line);
            const [criterion, criterion_description] = parts.splice(0, 2);
            const ratings = {};

            for (let i = 0; i < parts.length; i += 2) {
                const rating_description = parts[i];
                const rating_points = parseFloat(parts[i + 1]);
                if (rating_description && !isNaN(rating_points)) { // Verificar que la descripción y los puntos no estén vacíos o sean NaN
                    ratings[(i / 2) + 1] = {
                        description: rating_description,
                        points: rating_points
                    };
                }
            }

            criteria[index] = {
                description: criterion,
                long_description: criterion_description,
                ratings: ratings
            };
        });

        return criteria;
    }

    function parseCSVLine(line) {
        const result = [];
        let insideQuotes = false;
        let value = '';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                result.push(value.trim());
                value = '';
            } else {
                value += char;
            }
        }

        if (value) {
            result.push(value.trim());
        }

        return result;
    }

    async function createRubricInCanvas(courseId, rubricTitle, criteria, accessToken) {
        const url = `https://${window.location.hostname}/api/v1/courses/${courseId}/rubrics`;

        const rubricPayload = {
            rubric: {
                title: rubricTitle,
                criteria: criteria
            },
            rubric_association: {
                association_type: 'Course',
                association_id: parseInt(courseId, 10)
            }
        };

        try {
            const response = await axios.post(url, rubricPayload, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200 || response.status === 201) {
                alert('Rúbrica subida con éxito!');
                console.log(response.data);
            } else {
                alert('Error al subir la rúbrica: ' + response.data.errors);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al subir la rúbrica.');
        }
    }
})();
