# LiLi · Base de identidad visual

Estado: propuesta inicial para revisar antes de diseñar pantallas.

La [lámina visual](./identidad-visual.html) muestra los colores de ambos temas y
ejemplos de sus combinaciones. Se puede abrir directamente en el navegador y no
carga fuentes ni recursos externos. El nombre es una muestra tipográfica, no un
logo definitivo.

## Dirección

LiLi es un asistente privado para su creador y su familia. La identidad busca ser
serena, cercana y discreta, agradable de usar a diario. El morado aporta
personalidad; los neutros ocupan la mayor parte de la interfaz.

## Paleta por función

Se conservan los colores de la propuesta original. El texto sobre la acción
principal se especifica para evitar usar blanco sobre la lavanda del tema oscuro.

| Función                      | Tema claro | Tema oscuro | Uso previsto                                         |
| ---------------------------- | ---------- | ----------- | ---------------------------------------------------- |
| Morado principal             | `#6D5AA6`  | `#B9A5E8`   | Acciones principales, enlaces y acentos de identidad |
| Morado suave                 | `#EEE9F7`  | `#332A46`   | Fondo de selección y énfasis suave                   |
| Fondo general                | `#F7F6FA`  | `#17141D`   | Base de la pantalla                                  |
| Superficie                   | `#FFFFFF`  | `#221E2A`   | Tarjetas, paneles y diálogos                         |
| Texto principal              | `#262230`  | `#F2EEF8`   | Contenido y títulos                                  |
| Texto secundario             | `#655F70`  | `#B9B2C5`   | Ayudas y metadatos                                   |
| Texto sobre morado principal | `#FFFFFF`  | `#262230`   | Etiquetas de acciones con fondo morado               |

El morado suave es un fondo, no un sustituto del color de texto secundario. Una
selección debe tener un indicador reconocible además del cambio de fondo.

### Estados: candidatos para el tema claro

| Estado      | Color     | Texto sobre el color | Ejemplo de mensaje       |
| ----------- | --------- | -------------------- | ------------------------ |
| Éxito       | `#2E7D65` | `#FFFFFF`            | Recordatorio guardado    |
| Advertencia | `#946200` | `#FFFFFF`            | Hay cambios sin guardar  |
| Error       | `#B54755` | `#FFFFFF`            | No se ha podido conectar |
| Información | `#356D9A` | `#FFFFFF`            | Conectando con LiLi      |

Estos colores no definen aún los fondos suaves de avisos. La primera implementación
de `src/app/theme.ts` añade variantes oscuras provisionales con texto `#262230`:
éxito `#7BC9AB`, advertencia `#E4BA67`, error `#EF9AA5` e información `#8FBDDF`.
Los estados se comunicarán también con texto y, cuando ayude, un icono.

### Contraste comprobado

Ratios calculados con los valores hexadecimales sólidos, sin transparencias:

| Combinación                                            | Ratio                       |
| ------------------------------------------------------ | --------------------------- |
| Blanco sobre morado principal claro                    | 5,73:1                      |
| Texto secundario claro sobre fondo general claro       | 5,70:1                      |
| Texto oscuro `#262230` sobre morado principal oscuro   | 7,10:1                      |
| Texto secundario oscuro sobre superficie oscura        | 7,95:1                      |
| Blanco sobre éxito / advertencia / error / información | 4,96 / 5,24 / 5,25 / 5,52:1 |

Estas combinaciones superan el mínimo de 4,5:1 para texto normal de
[WCAG AA](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
Blanco sobre `#B9A5E8` da 2,19:1 y no sirve para texto normal.

Los fondos morados suaves contrastan aproximadamente 1,2:1 con sus superficies;
no bastan por sí solos para identificar un control o su selección. Se comprobarán
los bordes, iconos y estados contra el criterio de
[contraste no textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
en las muestras de componentes. Estas comprobaciones no validan una interfaz
completa.

## Logo

Logo provisional elegido por el creador: el símbolo morado de la imagen facilitada
en la conversación, con un contorno exterior de ocho puntas y una forma circular
interior con cuatro puntas. Esta elección sustituye la exploración del monograma
«Li».

Conservar la forma y el color del archivo original. El nombre **LiLi** puede
acompañar al símbolo como texto independiente; su tipografía sigue pendiente.

El archivo original ya está incorporado como
[public/lili-symbol.png](../public/lili-symbol.png), conservando su forma, color
y transparencia. La aplicación lo comparte entre la cabecera y el favicon de la
pestaña del navegador. La lámina conserva su muestra tipográfica. Una versión
vectorial podrá incorporarse si se dispone del original en ese formato.

## Tipografía y formas

Inter es la candidata inicial para textos y controles. Falta compararla con el
logo y decidir pesos, tamaños y forma de servirla. La lámina utiliza la fuente
del sistema para no depender de una instalación local ni de una descarga externa.
El nombre puede tener ajustes propios sin trasladarlos al texto de la interfaz.

La dirección propuesta utiliza esquinas moderadamente redondeadas, iconos
sencillos, sombras discretas y espacio suficiente entre elementos. Los valores
exactos de radios, espaciado y tipografía se decidirán con muestras de componentes.

## Voz

Lenguaje natural, directo y útil. Preferir «Añadir tarea», «Recordatorio guardado»
y «No se ha podido conectar». Los mensajes deben corresponder al comportamiento
real de la aplicación; estos ejemplos no anuncian funcionalidades implementadas.

## Antes de diseñar pantallas

1. Revisar esta base de color en claro y oscuro.
2. Incorporar el archivo del logo provisional elegido y comparar la tipografía
   junto al símbolo.
3. Revisar bordes, foco, hover, pulsación, deshabilitado y estados oscuros sobre
   la implementación inicial.
4. Probar las decisiones en unas pocas muestras de controles con Material UI.
5. Recoger los valores elegidos en el tema y comenzar las pantallas.

La aplicación utiliza esta base en las pantallas de acceso, tareas y formularios,
con Material UI y el tema centralizado en `src/app/theme.ts`. Se implementan las dos paletas y un selector
de apariencia: claro, oscuro o sistema, con preferencia guardada por Material UI.
La tipografía utiliza la fuente del sistema, el radio base provisional es de 8 px
y los botones conservan la escritura natural, sin mayúsculas forzadas. Estas
decisiones se podrán ajustar al revisar las muestras y el logo.
