# Parte técnica: Pozo sin luz

Aquí encuentras en pocas palabras cómo está organizado el código y cómo se construye. La bienvenida y las primeras ideas
para cambiar el juego están en `README.md`.

## Organización

Es un proyecto para MakeCode Arcade, escrito en TypeScript. `pxt.json` da el nombre del proyecto `pozo-sin-luz`, la
paleta de 16 colores y la lista de todos los archivos, en el orden en que MakeCode los lee. `mkc.json` dice para qué
aparato se construye: el Calliope mini 3 con GameKit (variante «n3»).

Los archivos del juego:

- `reglas.ts`: Las reglas de la noche de trabajo: salas, personaje, Brummi, lámpara, silbato, menús y práctica.
- `graficos.ts`: Todos los dibujos son pixel art de 160 x 120 píxeles.
- `cine.ts`: La intro, puesta en escena como una pequeña película, en una sola línea de tiempo que deja tiempo para
  leer.
- `sonido.ts`: Una música amable y un ambiente suave de mina; cada voz termina por apagarse.
- `main.ts`: Adaptador del aparato: lee las teclas y le da al juego el tiempo que ha pasado.

El juego se reparte en tres espacios de nombres: `Noche` (las reglas y el dibujo, repartidos entre `reglas.ts` y
`graficos.ts`), `NocheSonido` (música y ruidos) y `Cine` (la intro).

## Cómo funciona el juego

1. `main.ts` prepara el sonido (`NocheSonido.preparar`) y conecta el botón de menú con `Noche.alternarPausa`.
2. El juego empieza en el estado `Estado.Intro`: la intro con la tarjeta del estudio del Calliope Hacker. La primera
   pulsación de A o B salta a la tarjeta del estudio; solo la segunda, 1,5 s después como pronto, abre el menú del
   título.
3. Después vienen el menú del título (`Estado.Titulo`), la oferta de práctica (`Estado.OfertaPractica`) y la práctica
   en 13 pasos (`Estado.Practica`).
4. En todos los estados, `main.ts` llama a `Noche.actualizar` en cada vuelta con el tiempo transcurrido y las teclas
   pulsadas. En el estado `Estado.Partida` las reglas trabajan ahí: mover al personaje, la lámpara, el silbato, Brummi
   (`actualizarBrummi`) y los fusibles.
5. `Noche.dibujar` vuelve a dibujar cada cuadro: la sala, la oscuridad con el haz de luz, Brummi, el panel y, según el
   estado, el título, la práctica, la pausa o el resultado.
6. `NocheSonido.actualizar` toca los sonidos que las reglas han pedido con `pedirSonido`.

La mina tiene 12 salas de 20 × 15 baldosas, y cada baldosa mide 8 × 8 píxeles. Cada baldosa es un número: 0 suelo,
1 muro, 2 metal y 3 agua. Las salas se colocan con `SALA_X` y `SALA_Y`, y sus nombres están en `NOMBRES_SALA`.

## Construir el juego

- **En el navegador:** abre arcade.makecode.com, elige «Importar» y abre el archivo del juego `pozo-sin-luz.hex`.
  Todo el código está en el archivo del juego. El simulador enseña el juego enseguida.
- **En el ordenador:** con la herramienta de línea de órdenes de MakeCode (paquete npm `makecode`), ejecuta
  `makecode build` en esta carpeta. El archivo del juego para el aparato queda después en `built/n3/binary.hex`.

## En el aparato

Conecta el Calliope mini 3 al ordenador con el cable USB. Aparece como una unidad. Arrastra el archivo del juego
(`.hex`) a esa unidad; después el juego arranca solo. La pantalla del GameKit tiene 160 × 120 píxeles y 16 colores.
Este juego no guarda nada.

Este juego también existe en alemán, inglés y francés. Las cuatro versiones salen del mismo proyecto de partida.
