# Cobertura del suelo en San Pedro de los Milagros con Dynamic World

Script de Google Earth Engine para obtener y recortar la clasificación de
coberturas de Dynamic World V1 (10 m) en el municipio de San Pedro de los
Milagros (Antioquia, Colombia) y en una zona de estudio.

---

## Contenido del repositorio

- `script/land_cover_dynamic_world.js`: script de Google Earth Engine.
- `data/roi/smp/`: shapefile del municipio de San Pedro de los Milagros.
- `data/roi/ze/`: shapefile de la zona de estudio.
- `data/resultados/`: tablas de área por clase (CSV).


---

## Método

1. Se carga la colección `GOOGLE/DYNAMICWORLD/V1` y se selecciona la banda `label`.
2. Se filtra por el municipio y por el periodo de análisis.
3. Se calcula la moda temporal (la clase más frecuente en cada píxel).
4. Se recorta con el límite municipal y luego con la zona de estudio.
5. Se calcula el área por clase en hectáreas, a 10 m.
6. Se exportan los GeoTIFF (EPSG:9377) y las tablas CSV.

---

## Cómo reproducirlo

1. Tener una cuenta de Google Earth Engine (code.earthengine.google.com).
2. En el Code Editor: Assets → New → Table upload → Shape files.
   Subir juntos los archivos .shp, .shx, .dbf, .prj (y .cpg) de cada carpeta de `data/roi/`.
3. Copiar el contenido de `script/land_cover_dynamic_world.js` en el Code Editor.
4. En la sección 1 del script, cambiar `TU_PROYECTO` por el ID de tu proyecto
   (y el nombre de los assets si usaste otros).
5. Pulsar Run y revisar la consola.
6. En la pestaña Tasks, pulsar Run en cada exportación.

---

## Clases de Dynamic World

| Valor | Clase |
|---|---|
| 0 | Agua |
| 1 | Árboles |
| 2 | Pasto |
| 3 | Vegetación inundada |
| 4 | Cultivos |
| 5 | Arbustos/matorral |
| 6 | Construido |
| 7 | Suelo desnudo |
| 8 | Nieve/hielo |

---

## Limitaciones

Dynamic World es una clasificación global y automática. Los resultados no
han sido validados con datos de campo en esta zona.

---

## Referencias

- Brown, C. F., et al. (2022). Dynamic World, Near real-time global 10 m land
  use land cover mapping. Scientific Data, 9, 251.
- Gorelick, N., et al. (2017). Google Earth Engine: Planetary-scale geospatial
  analysis for everyone. Remote Sensing of Environment, 202, 18-27.

---

## Cómo citar

Cañas Ospina, C. D. (2026). Cobertura del suelo en San Pedro de los Milagros
con Dynamic World (v1.0) [Software]. GitHub. 


---

## Licencia

Código bajo licencia MIT.