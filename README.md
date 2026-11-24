# Astro-Clima — Tablero meteorológico

[![Abrir Astro-Clima](https://img.shields.io/badge/Abrir_Astro--Clima-38bdf8?style=for-the-badge&logo=githubpages&logoColor=white)](https://kuckling.github.io/astro-clima/)

🌐 **Ver el tablero en vivo: https://kuckling.github.io/astro-clima/**

Tablero en una sola página HTML para **observación astronómica**: combina los datos que la estación EBC ya envía a ThingSpeak con los parámetros que necesita un observatorio para decidir si se puede observar. Fue creado para el **Observatorio Astronómico El Arado** (San Pedro Pinula, Jalapa) y funciona con cualquier estación pública de ThingSpeak.

## Las dos secciones, separadas a propósito

### 📡 Datos de la estación (medidos por la EBC)
Temperatura, humedad, presión a nivel del mar, punto de rocío, base de nubes (LCL) e índice de lluvia del firmware. También muestra la **calidad de datos**: cuántas muestras llegaron en la última hora (esperadas: 12) y en las últimas 3 h (esperadas: 36).

### 🔭 Datos para observación astronómica (calculados + pronóstico)
- **Margen de empañamiento (T − Td)** con su nivel de riesgo de rocío.
- **Horas estimadas hasta empañamiento**, según cuánto se está enfriando el aire (estimación, no garantía).
- **Tendencia de presión 3 h** (por regresión, sobre presión de estación) y **tendencia de humedad 1 h** (por regresión, no primer-contra-último).
- **Nubosidad pronosticada y probabilidad de precipitación esta noche** (18:00–06:00, Open-Meteo).
- **Resumen de condiciones para observar**, **viento del modelo** (velocidad y dirección actuales, ráfagas y máxima de la noche — la estación no tiene anemómetro, así que el viento solo viene de Open-Meteo), **fase de la Luna** (dato de Open-Meteo: nombre, iluminación y horas de salida y puesta; si el dato no llega, se calcula en la página) y **dos gráficas de las últimas 24 h, una al lado de la otra en el tiempo**: la primera con la temperatura y el punto de rocío **medidos por la estación EBC**, la segunda con los mismos datos según el **modelo Open-Meteo para el lugar donde está la estación** (las coordenadas del pronóstico de la noche siguen siendo las del observatorio, donde se mira), con la altitud de la estación en el pedido (`&elevation=`), para que el modelo represente la altura donde está el sensor y no la del casco urbano. Las dos gráficas usan las **mismas 24 etiquetas horarias** (medias horarias de la estación, no cada lectura de 5 min): empiezan a la misma hora, se comparan directo, y las horas sin datos se ven como huecos en la línea. Debajo de la segunda, el tablero dice en cuánto se apartó el modelo de la estación en promedio (modelo − estación, hora por hora). Si las curvas se parecen, el modelo representa bien el sitio; si se separan, manda la estación, que mide el aire real.

El pronóstico es de modelo numérico, no medición local. El firmware de la estación **no se tocó**: todo lo nuevo se calcula en el navegador.

## Tema, tipografía y estrellas

- **Botón "Luz roja"** en el encabezado: cambia a modo de luz roja para no perder la visión nocturna en el observatorio (solo tonos rojos sobre negro; los niveles siempre llevan texto). Queda guardado en el navegador y se aplica antes de pintar la página, para que no parpadee.
- **Tipografía**: títulos en Fraunces (serif) y números, botones y etiquetas en IBM Plex Mono. Si no hay internet, caen a Georgia y a la mono del sistema.
- **Estrellas de fondo** en modo normal (se ocultan en modo rojo).

## Reporte mensual en PDF

El botón **Reporte** abre el panel al final de la página: se elige el mes y se descarga un PDF (jsPDF, se carga solo al generarlo) con portada y resumen del mes, series horarias, riesgo de rocío por noche, calidad de los datos, **comparación de la estación contra el modelo Open-Meteo** (tabla de R, sesgo, MAE y RMSE, gráficas de dispersión con línea 1:1, sesgo por hora del día y **gráfica comparativa con las dos series hora por hora**) y resumen diario.

El reporte pide la estación en **medias horarias** (`average=60` de ThingSpeak): un mes completo son ~720 registros en un solo pedido, lejos del límite de 8,000 por consulta. Por eso las mínimas y máximas del reporte son la menor y mayor **media horaria** (no picos de 5 min) y la calidad de datos se cuenta **por hora**. El modelo del mes viene del archivo histórico de Open-Meteo, con las coordenadas y la altitud de la estación elegida.

## Configuración

En la tarjeta superior se elige la estación (Cobán, Gualán o El Teocinte, o un canal manual) y la latitud/longitud del pronóstico. Queda guardado en el navegador.

## Cualquier estación pública, solo con el ID

No hace falta que sea una EBC: basta escribir el **ID de cualquier canal público de ThingSpeak** y el tablero se conecta. El mapeo de campos se detecta solo por el nombre de cada campo del canal (temperatura, humedad, presión), con conversión de unidades automática (°F → °C, inHg o mmHg → hPa). Si la estación no envía el punto de rocío, se calcula con la fórmula de Magnus (la misma del firmware EBC); si no envía la base de nubes, se calcula del margen de empañamiento. La tarjeta del índice de lluvia solo aparece cuando la estación lo envía (es propio de las EBC). Si un sensor está averiado y manda valores imposibles (por ejemplo −130 °C), esa lectura se descarta y el tablero lo dice en vez de mostrar un disparate. El mapeo detectado se puede corregir a mano en la tarjeta de configuración y queda guardado para ese canal.

## Detalles que se corrigieron (2026-11-23)

- **Tendencia de presión sobre presión de estación, por regresión.** La presión del campo 3 viene reducida a nivel del mar con la temperatura: a ~1300 m eso mete ~0.55 hPa por cada °C, y una tarde que se enfría 4 °C "sube" la presión ~2 hPa sin que cambie nada real. Ahora la tendencia se calcula sobre la presión de estación (se invierte la reducción con la altitud y la T de cada registro, igual que el comparador) y por regresión lineal, no primer-contra-último. La altitud se pone en la configuración (precargada para Cobán, Gualán y El Teocinte) y se puede indicar si la estación envía presión a nivel del mar o a nivel de estación. El umbral es ±1.0 hPa en 3 h: en el trópico la marea atmosférica semidiurna mueve la presión ~1 hPa sola. Una lectura sin presión ya no entra a la regresión (la presión de estación es NaN, nunca nulo, así que los filtros la excluyen); sin altitud, el tablero avisa "sin altitud" y usa la presión a nivel del mar.
- **Ventana nocturna después de medianoche.** Entre las 00:00 y las 06:00 la noche en curso es la que empezó ayer a las 18:00; antes el tablero saltaba a la noche siguiente y perdía justo la que se estaba observando.
- **Veredicto sin pronóstico.** Si Open-Meteo falla, el tablero dice "Sin pronóstico: no se puede evaluar la nubosidad", en vez de decir "Buenas" por falta de datos. Lo mismo con el margen de rocío: sin punto de rocío válido no muestra "Bajo riesgo". Y si hay probabilidad de lluvia pero no llegó el dato de nubosidad, tampoco dice "cielo despejado": dice "Regulares: sin dato de nubosidad". Si ThingSpeak falla, el recuadro del veredicto se resetea a neutro en vez de conservar el color del cálculo anterior.
- **Datos viejos.** Si la última lectura tiene más de 15 minutos, el indicador cambia a "Datos viejos" en vez de seguir verde como "Conectado".
- **Margen de rocío pronosticado y nubosidad por capas.** El pronóstico ahora trae temperatura y punto de rocío del modelo (margen mínimo de la noche) y la nubosidad separada en baja, media y alta, para distinguir el cirro delgado de la nube baja.
- Chart.js fijado a la versión 4.4.1. El service worker ya no cacheaba las llamadas a ThingSpeak ni a Open-Meteo (verificado).
- **Gráficas de 24 h alineadas por hora** (fusión 2026-11-23): las dos usan las mismas 24 etiquetas horarias y medias horarias de la estación; las horas sin datos se ven como huecos. La altitud de la estación manda sobre el campo editable en el pedido del modelo. Los pedidos a ThingSpeak usan un solo ayudante (`fetchRange`) y los números se validan con `okNum()` (un nulo ya no entra a promedios ni diferencias como 0).

> La estación de El Arado todavía no tiene canal propio de ThingSpeak. Mientras se instala, el tablero arranca con **Cobán** para probar. Cuando la estación esté en el observatorio, se pone su canal y listo. La latitud/longitud por defecto son las de San Pedro Pinula (14.6639, −89.8468).

## Instalar como aplicación (PWA)

El paquete trae `manifest.json` y `sw.js`, así que el tablero se instala como aplicación y abre a pantalla completa, sin la barra del navegador. Sin internet se abre la app, pero los datos necesitan conexión.

**Android (Chrome):** abre el tablero, toca los tres puntos ⋮ → **Instalar aplicación** (en algunas versiones dice **Agregar a pantalla principal**). Queda el icono en la pantalla de inicio.

**iPhone (Safari):** abre el tablero, toca Compartir (el cuadro con la flecha hacia arriba) → **Añadir a pantalla de inicio** → Añadir.

**Computadora (Chrome o Edge):** abre el tablero, toca los tres puntos ⋮ → **Instalar Astro-Clima** (o el icono de instalar que aparece en la barra de direcciones). Como alternativa, se puede crear un acceso directo: tres puntos ⋮ → Guardar y compartir → **Crear acceso directo** (en versiones anteriores: Más herramientas → Crear acceso directo).

## Publicar

1. Crea el repositorio en GitHub (nombre sugerido: `astro-clima`).
2. Sube `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `README.md` y `LICENSE`.
3. Activa GitHub Pages (Settings → Pages → Deploy from a branch → `main`).

## Licencia

Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0). Ver `LICENSE`.

## Autor

**Marlon Estuardo Alvarado Kuckling** · Ingeniero Industrial · Proyecto EBC Kuckling, Guatemala.

Datos de la estación: ThingSpeak. Pronóstico: Open-Meteo.
