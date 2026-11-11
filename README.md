# Pozo sin luz

¡Hola! Esto es **Pozo sin luz**, un juego de **Calliope Hacker** para el **Calliope mini 3 con GameKit**.

Es de noche en la mina. Se ha ido la luz y solo tienes la lámpara de tu casco. Encuentra cinco fusibles, ponlos en el
generador y sube en el ascensor. Cuida tu lámpara: cuando se queda sin carga, la noche ha terminado. A Brummi, el
pequeño robot de mantenimiento, le encanta ordenar: cada vez que te alcanza, te quita un fusible y lo devuelve a su
sitio. El Calliope Hacker lo construyó y lo mira todo desde la sala de control, arriba.

## Cómo se juega

- **Cruceta:** caminar
- **A + dirección:** correr (hace ruido)
- **A:** recoger un fusible o una batería, entrar en una taquilla y salir de ella
- **Mantener A delante del generador:** colocar un fusible
- **B, pulsación corta:** encender o apagar la luz
- **Mantener B:** silbar; si Brummi está cerca, se para un momento y escucha
- **Menú:** pausa

## Cámbialo tú

Todo el código fuente está dentro del archivo del juego. Ábrelo en MakeCode Arcade (arcade.makecode.com, «Importar»).
Cambia un número, arranca el simulador y mira qué pasa:

- **La lámpara dura más:** en `reglas.ts` está `CONSUMO_HAZ = 0.30`. Es el porcentaje que se pierde por
  segundo con la luz encendida. Prueba con `0.1`.
- **Brummi es más rápido:** en `reglas.ts` está `VELOCIDAD_SEGUIR = 64`. Son los píxeles por
  segundo cuando Brummi te sigue. Con `90` tendrás que correr.
- **Silbar más a menudo:** en `reglas.ts` está `PAUSA_SILBATO_MS = 6000`. Es la espera entre dos
  silbidos, en milisegundos. Prueba con `1000`.

La explicación del código para niños, familias y docentes está en calliope-hacker.de.
