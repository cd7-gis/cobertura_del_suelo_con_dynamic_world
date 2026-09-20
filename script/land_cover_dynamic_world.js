/*
==========================================================================================================================

COBERTURA DE SUELO CON DATOS DE DYNAMIC WORLD
Municipio San Pedro de los Milagros, Antioquia (Colombia)

----------------------------------------------------------------------------------------------------------------------------

Autor: Cristian David Cañas Ospina 
        Estudiantye de Ciencias ambientales,
        Instituto Tecnológico Metropolitano - ITM

Correo electrónico: cristiancanas331218@correo.itm.edu.co
Fecha de ejecución: 19-09-2026
Plataforma: Google Earth Engine 
            editor de codigo(code editor) code.earthengine.google.com

Fuente: GOOGLE/DYNAMICWORLD/V1 (banda 'label'), periodo 2025-08-01 a 2026-08-31
Método: moda temporal, recorte al municipio y a la zona de estudio
Salida: mapa de cobertura del suelo (9 clases de Dynamic World) y tabla de áreas por clase en hectáreas (ha)

--------------------------------------------------------------------------------------------------------------------------

IMPORTANTE 
ANTES DE EJECUTAR : Para ejecutar debes agregar tus propios poligonos de estudio, 
en este caso se agregaron los polígonos del municipio de San Pedro de los Milagros y la zona de estudio, estos polígonos se encuentran en
la carpeta assets del proyecto.

===========================================================================================================================
*/

//------------------------------------------------------------------------------------------
// 1. CARGA DE DATOS
//------------------------------------------------------------------------------------------

var sanPedrodelosMilagros = ee.FeatureCollection("projects/TU_PROYECTO/assets/san_pedro_de_los_milagros");  // cambiar por la ruta de tu municipio
var zonaEstudio = ee.FeatureCollection("projects/TU_PROYECTO/assets/zona_estudio");                         // cambiar por la ruta de tu zona de estudio

var roi = sanPedrodelosMilagros.geometry();
var roiZonaEstudio = zonaEstudio.geometry();


//------------------------------------------------------------------------------------------
// 2. PARÁMETROS DE ENTRADA
//------------------------------------------------------------------------------------------

var fechaInicio = '2025-08-01';
var fechaFin = '2026-08-31';
var carpetaSalida = 'GEE';    // carpeta de salida en Google Drive
var crs = 'EPSG:4326';        // sistema de referencia para exportar (EPSG:4326 = WGS84 estandar)
var escala = 10;              // resolución espacial en metros


//------------------------------------------------------------------------------------------
// 3. CARGA DE IMÁGENES DE DYNAMIC WORLD
//------------------------------------------------------------------------------------------

var dynamicWorld = ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1')
  .filterBounds(roi)
  .filterDate(fechaInicio, fechaFin)
  .select('label');

print('Escenas usadas:', dynamicWorld.size());

var coberturaSuelo = dynamicWorld.mode().clip(roi);                        // recorte al municipio
var coberturaSueloZonaEstudio = coberturaSuelo.clip(roiZonaEstudio);       // recorte a la zona de estudio


//------------------------------------------------------------------------------------------
// 4. CLASES DE COBERTURA DEL SUELO Y COLORES
//------------------------------------------------------------------------------------------

var nombres = ['Agua', 'Árboles', 'Pasto', 'Vegetación inundada', 'Cultivos',
               'Arbustos/matorral', 'Construido', 'Suelo desnudo', 'Nieve/hielo'];

var colores = ['#419BDF', '#397D49', '#88B053', '#7A87C6', '#E49635',
               '#DFC35A', '#C4281B', '#A59B8F', '#B39FE1'];

var simb = {min: 0, max: 8, palette: colores};


//------------------------------------------------------------------------------------------
// 5. VISUALIZACIÓN
//------------------------------------------------------------------------------------------

Map.centerObject(sanPedrodelosMilagros, 12);
Map.addLayer(coberturaSuelo, simb, 'Cobertura San Pedro de los Milagros');
Map.addLayer(coberturaSueloZonaEstudio, simb, 'Cobertura zona de estudio');
// el color de los contornos se cambia con el parámetro 'color'
Map.addLayer(sanPedrodelosMilagros.style({color: 'red', fillColor: '00000000', width: 2}), {}, 'San Pedro de los Milagros');
Map.addLayer(zonaEstudio.style({color: 'yellow', fillColor: '00000000', width: 2}), {}, 'Zona de estudio');


//------------------------------------------------------------------------------------------
// 6. ÁREA POR CLASE DE COBERTURA DEL SUELO (HECTÁREAS)
//------------------------------------------------------------------------------------------

function areaPorClase(img, geom) {
  var s = ee.Image.pixelArea().divide(10000)
    .addBands(img.rename('clase'))
    .reduceRegion({
      reducer: ee.Reducer.sum().group({groupField: 1, groupName: 'clase'}),
      geometry: geom,
      scale: escala,
      maxPixels: 1e13,
      tileScale: 4
    });

  var grupos = ee.List(ee.Algorithms.If(s.contains('groups'), s.get('groups'), []));

  return ee.FeatureCollection(grupos.map(function(g) {
    g = ee.Dictionary(g);
    var c = ee.Number(g.get('clase')).int();
    return ee.Feature(null, {
      clase: c,
      nombre: ee.List(nombres).get(c),
      area_ha: g.get('sum')
    });
  }));
}

var tablaMunicipio = areaPorClase(coberturaSuelo, roi);
var tablaZonaEstudio = areaPorClase(coberturaSueloZonaEstudio, roiZonaEstudio);
print('Áreas municipio (ha):', tablaMunicipio);
print('Áreas zona de estudio (ha):', tablaZonaEstudio);


//------------------------------------------------------------------------------------------
// 7. EXPORTACIÓN DE RESULTADOS (se ejecutan desde la pestaña Tasks, botón Run)
//------------------------------------------------------------------------------------------

Export.image.toDrive({
  image: coberturaSuelo,
  description: 'DW_Municipio',
  folder: carpetaSalida,
  region: roi,
  scale: escala,
  crs: crs,
  maxPixels: 1e13
});

Export.image.toDrive({
  image: coberturaSueloZonaEstudio,
  description: 'DW_ZonaEstudio',
  folder: carpetaSalida,
  region: roiZonaEstudio,
  scale: escala,
  crs: crs,
  maxPixels: 1e13
});

Export.table.toDrive({
  collection: tablaMunicipio,
  description: 'Areas_Municipio',
  folder: carpetaSalida,
  fileFormat: 'CSV'
});

Export.table.toDrive({
  collection: tablaZonaEstudio,
  description: 'Areas_ZonaEstudio',
  folder: carpetaSalida,
  fileFormat: 'CSV'
});
