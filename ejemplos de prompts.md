## Guía para la Generación de Rúbricas en ChatGPT
### Introducción
Esta guía está diseñada para ayudarte a generar y ajustar rúbricas en formato CSV utilizando ChatGPT. Incluye instrucciones y ejemplos de prompts para crear rúbricas desde cero o ajustar rúbricas existentes al formato CSV requerido.

### Prompts sugeridos
#### Para ajustar una rúbrica ya creada al formato CSV
Para convertir una rúbrica existente a un formato CSV con encabezados específicos, utiliza el siguiente prompt:


*Ajusta la rúbrica a formato CSV con los siguientes encabezados: criterion, criterion_description, rating_description_1, rating_points_1, rating_description_2, rating_points_2, rating_description_n, rating_points_n. Asegúrate de que todas las descripciones estén entre comillas , los puntos no deben estar entre comillas.*


#### Para crear una rúbrica desde cero
Para crear una rúbrica nueva, especifica los criterios y niveles de desempeño deseados, así como los encabezados requeridos para el formato CSV. Utiliza el siguiente prompt:

*Crea una rúbrica para evaluar [actividad o producto] que contenga [número] criterios y [número] niveles de desempeño por criterio. Los niveles de evaluación van de [número] a [número] puntos, e incluye una descripción detallada de cada criterio y nivel. La rúbrica debe estar en formato CSV con los siguientes encabezados: criterion, criterion_description, rating_description_1, rating_points_1, rating_description_2, rating_points_2, rating_description_n, rating_points_n. Asegúrate de que todas las descripciones estén entre comillas dobles, los puntos no deben estar entre comillas.*

#### Resultado espreado

```csv
criterion,criterion_description,rating_description_1,rating_points_1,rating_description_2,rating_points_2,rating_description_3,rating_points_3
"Organización","Claridad en la estructura","Deficiente",1,"Adecuado",2,"Excelente",3
"Contenido","Exactitud de la información","Insuficiente",1,"Satisfactorio",2,"Sobresaliente",3
"Creatividad","Uso de elementos visuales","Limitado",1,"Apropiado",2,"Innovador",3
```
