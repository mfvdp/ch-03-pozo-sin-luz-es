// La intro, puesta en escena como una pequeña película, en una sola línea de tiempo que deja tiempo para leer. Todo se
// dibuja directamente al tamaño de la pantalla: no se crea ninguna imagen durante la película, la película no usa el
// azar del juego (Noche.azar) y ninguna imagen viene de fuera.
namespace Cine {
    // Las letras de 5 x 7 que comparten el nombre del juego (graficos.ts) y la tarjeta «CALLIOPE HACKER». Son las de la
    // constante alfabeto: de la A a la Z y 13 letras especiales como É, Ç o Ü; cualquier otra se queda en blanco.
    const alfabeto = "ACEHIKLOPRNTSBDFGJMQUVWXYZÀÁÈÉÊÍÓÚÇÑÄÖÜ"
    const patronesLetras = [
        "01110100011000111111100011000110001",
        "01111100001000010000100001000001111",
        "11111100001000011110100001000011111",
        "10001100011000111111100011000110001",
        "11111001000010000100001000010011111",
        "10001100101010011000101001001010001",
        "10000100001000010000100001000011111",
        "01110100011000110001100011000101110",
        "11110100011000111110100001000010000",
        "11110100011000111110101001001010001",
        "10001110011010110011100011000110001",
        "11111001000010000100001000010000100",
        "01111100001000001110000010000111110",
        "11110100011000111110100011000111110",
        "11110100011000110001100011000111110",
        "11111100001000011110100001000010000",
        "01111100001000010111100011000101111",
        "00001000010000100001000011000101110",
        "10001110111010110101100011000110001",
        "01110100011000110001101011001001101",
        "10001100011000110001100011000101110",
        "10001100011000110001100010101000100",
        "10001100011000110101101011010101010",
        "10001100010101000100010101000110001",
        "10001100010101000100001000010000100",
        "11111000010001000100010001000011111",
        "01000001000111010001111111000110001",
        "00010001000111010001111111000110001",
        "01000001001111110000111101000011111",
        "00010001001111110000111101000011111",
        "00100010101111110000111101000011111",
        "00010001001111100100001000010011111",
        "00010001000111010001100011000101110",
        "00010001001000110001100011000101110",
        "01111100001000010000011110010001100",
        "01101100101000111001101011001110001",
        "01010000000111010001111111000110001",
        "01010000000111010001100011000101110",
        "01010000001000110001100011000101110"
    ]
    // El Calliope Hacker: una copia de los datos de la figura, de 64 x 40 píxeles, el índice 0 es transparente,
    // dibujada solo con PALETA_ESTUDIO. No escribas nunca en HACKER ni lo clones (es un literal guardado en la memoria
    // del programa). PALETA_MINA es la paleta del juego, declarada en pxt.json.
    export const PALETA_ESTUDIO = hex`000000ffffffffd23f2ee6d613998f7fd4ff2f6fe0ef3b45c58a4c7a4a26a7b0c6565d782b396607070be8a07a1a2038`
    export const HACKER = img`
        . . . . . . . . . . . . . . . . d d d d d . . . . . . . . . . . . . . . c . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . d d d d d d d 5 . . . . . c . c . b b b b b b b b b b b b b b b b b b b b b b . . . . . . . . . . .
        . . . . . . . . . . . . . d b b d d d d d d 5 . c . c . c . c d d d d d d d d d d d d d d d d d d d d d d . . . . . . . . . . .
        . . . . . . . . . . . . d b d d d d d d d d d 5 . c . c c c c d d f f f f f f f f f f f f f f f f f f d d . . . . . . . . . . .
        . . . . . . . . . . . . d b d d d d d d d d d 5 c c c c c c c d d f 5 5 5 5 5 5 f f f f f f f f f f f d d . c . . . . . . . . .
        . . . . . . . . . . . d b d d d d d d d d d d d 5 c c c c c c d d f f f f f f f f f f f f f f f f f f d d c . c . . . . . . . .
        . . . . . . . . . . . d d d d d d d d d d d d d 5 c c c c c c d d f f f 2 2 2 2 2 2 2 2 2 f f f f f f d d . c . c . . . . . . .
        . . . . . . . . . . . d d d d d d d d d d d d d 5 c c c c c c d d f f f f f f f f f f f f f f f f f f d d c c c . c . . . . . .
        . . . . . . . . . . . d d d d d d d d d d d d d 5 c c c c c c d d f f f 3 3 3 3 3 f f f f f f f f f f d d c c c c . c . . . . .
        . . . . . . . . . . . d d d d d d d d d d d d d 5 c c c c c c d d f f f f f f f f f f f f f f f f f f d d c c 2 2 c . c 2 2 . .
        . . . . . . . . . . . b d d d d d d d d d d d d 5 c c c c c c d d f f f f f 7 7 7 7 7 7 7 7 f f f f f d d c c 2 6 6 6 6 6 2 . .
        . . . . . . . . . . d d b d d d d d d d d d d d d 5 c c c c c d d f f f f f f f f f f f f f f f f f f d d c 6 6 6 6 6 6 6 6 6 .
        . . . . . . . . . d d d d b b d d d d d d d d d d d 5 c c c c d d f f f 5 5 5 5 5 5 5 5 5 5 5 f f f f d d 2 6 6 6 7 6 7 6 6 6 2
        . . . . . . d d d d d d d d d b b b b d d d d d d d d 5 c c c d d f f f f f f f f f f f f f f f f f f d d 2 6 6 6 7 7 7 6 6 6 2
        . . . . . d 3 3 3 3 3 3 d d d d d d d d d d d d d d d d 5 c c d d f 6 6 6 6 f f f f f f f f f f f f f d d c 6 6 6 6 7 6 6 6 6 .
        . . . . d 3 3 3 3 3 3 3 3 d d d d d d d d d d d d d d d d 5 c d d d d d d d d d d d d d d d d d d d d d d c c 2 6 6 6 6 6 2 . c
        . . . . d 3 3 3 3 3 3 3 4 d d d d d d d d d d d d b d d d d 5 d d d d d d d d d d d d d d d d d d d d d d c c 2 2 c d c 2 2 c .
        . . . . d 3 3 3 3 3 3 3 4 d d d d d d d d d d d d d b d d d d 5 c c c c c c c c c b b b c c c c c c c c c c c c c c c c . c . .
        . . . . d 4 3 3 3 3 3 3 4 d d d d d d d d d d d d d d b d d d d d e e c c c b b b b b b b b b c c c c c c c c c c c c . c . c .
        . . . . d 4 3 3 3 3 3 3 4 d d d d d d d d d d d d d d d b d d d d e e d d d 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        . . . . d 4 3 3 3 3 3 3 4 d d d d d d d d d d d d d d d d 6 b 5 b 3 b 7 b d 8 8 8 8 8 8 8 8 8 8 d d d d d d d d d d d d 8 8 8 8
        . . . . d 4 3 3 3 3 3 3 4 d d d d d d d d d d d d d d d 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 d d 1 d d a b a d 7 d 7 d d 8 8 8
        . . . . d 4 4 3 3 3 3 4 4 d d d d d d d d d d d d d d d 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 d 1 1 1 d d d d d 7 d 7 d d 8 8 8
        . . . . d 4 4 3 3 3 3 4 4 d d d d d d d d d d d d d d d d 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 d 1 d d d d d d d d d d 8 8 8 8
        . . . . . d 4 4 3 3 4 4 d d d d d d d d d d d d d d d d d d d d 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        . . . . . d 4 4 4 4 4 4 4 d d d d d d d d d d d d d d d d d d d d b 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        . . . . . . d 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 d d d d d d d d d d d d c c c c c c c c c c c b b c c . c . c . c . . b a a a a a a
        . . . . . . . d d d d d d d d d d d d d d d d d d d d d d d d d d d c c c c c c c c c c c b b c . c . c . . . . . b a a a a a a
        . . . . . . . . . . . . . . . . . d d . d d d d d . c d d d d d b . c . c . c . c . c . c b b . c . . . . . . . . b a a a a a a
        . . . . . . . . . . . . . . . . . d d . d d d d d . . c d d d d b c . c . c . c . c . c . b b . . 4 3 3 3 4 . . . b a b b b b a
        . . . . . . . . . . . . . . . . . d d . d d d d d . . . d d d d b . . . c . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a a a a a a
        . . . . . . . . . . . . . . . . . d d 3 3 3 3 3 3 3 . . d d d d b . . . . . . . . . . . . b b . 4 3 d d d 3 4 . . b a a a a a a
        . . d . . . d . . . . . . . . . . d d 3 1 3 3 3 3 3 . . d d d d b . . . . . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a a a a a a
        . . d d . d d . . . . . . . . . . d d 1 1 1 1 1 1 1 . . d d d d b . . . . . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a b b b b a
        . d 1 1 1 1 1 d 1 1 . . . . . . . d d . . . . . . . . 3 3 3 3 3 3 3 3 . . . . . . . . . . b b . 4 3 b b b 3 4 . . b a a a a a a
        . 1 1 d 1 1 1 1 1 1 1 d d d d d d d d d d d d d d . 3 3 1 3 3 3 3 3 3 3 . . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a a a a a a
        d 1 1 1 1 1 1 d d 1 1 . . . . d d . . . . . . d d . 1 1 1 1 1 1 1 1 1 1 . . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a a a a a a
        4 3 3 3 3 3 3 3 3 3 4 . . . . b b . . . . . . b b . . . . . . . . . . . . . . . . . . . . b b . . 4 4 4 4 4 . . . b a b b b b a
        . 4 4 4 4 4 4 4 4 4 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b a a a a a a
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b a a a a a a
    `
    export const PALETA_MINA = hex`000000eaf3dde65042a92d3fdd8b45f1cf7c49395378a29725384377c5c443616a151f2ba3b5a0625958353e40080c13`
    // Paleta del estudio para escenaSalaControl y para la tarjeta del estudio (escenaEstudio): de 23000 a 34500 ms de
    // la película (de 37 a 57 s en tiempo real).
    export function esMomentoEstudio(peliculaMs: number): boolean {return peliculaMs>=23000 && peliculaMs<34500}
    // Noche.dibujar llama a elegirPaleta() en cada cuadro con la paleta deseada; solo cambia cuando cambia el deseo.
    // Así, después de un salto, de saltarse la intro o de una pausa, la paleta correcta vuelve en el cuadro siguiente.
    let paletaEstudioActiva = false
    export function elegirPaleta(estudio: boolean) {
        if(estudio!=paletaEstudioActiva) {
            paletaEstudioActiva=estudio
            image.setPalette(estudio?PALETA_ESTUDIO:PALETA_MINA)
        }
    }
    export function esPaletaEstudio(): boolean {return paletaEstudioActiva}
    let fuente: image.Font
    let esReducido = false
    function limitar(x: number): number {return Math.max(0,Math.min(1,x))}
    function suavizar(x: number): number {x=limitar(x);return x*x*(3-2*x)}
    function rotular(texto: string,y: number,colorTinta: number) {
        screen.print(texto,Math.floor((160-texto.length*6)/2),y,colorTinta,fuente)
    }
    export function dibujarLetraGrande(letra: string,x: number,y: number,tamano: number,colorTinta: number) {
        let numero=alfabeto.indexOf(letra)
        if(numero<0)return
        let patron=patronesLetras[numero]
        for(let j=0;j<7;j++)for(let i=0;i<5;i++)
            if(patron.charAt(j*5+i)=="1")
                screen.fillRect(Math.round(x+i*tamano),Math.round(y+j*tamano),
                    Math.ceil(tamano),Math.ceil(tamano),colorTinta)
    }
    function dibujarBarrasCine() {
        screen.fillRect(0,0,160,9,15);screen.fillRect(0,111,160,9,15)
    }
    // Un juego de colores por paleta. La raya: 3 para el estudio, 8 para la mina. La segunda línea de texto: 5 para el
    // estudio, 12 para la mina. La primera línea siempre tiene el color 1.
    function mostrarSubtitulo(linea1: string,linea2: string) {
        screen.fillRect(5,90,150,21,15);screen.drawLine(32,90,127,90,paletaEstudioActiva?3:8)
        rotular(linea1,94,1);rotular(linea2,103,paletaEstudioActiva?5:12)
    }
    function dibujarMotas(escenaMs: number,cantidad: number,colorTinta: number) {
        if(esReducido)return
        for(let i=0;i<cantidad;i++) {
            let x=(i*47+escenaMs/80)%172-6,y=(i*29+escenaMs/(28+i%5))%99+9
            screen.drawLine(x,y,x-1,y+2,colorTinta)
        }
    }
    function dibujarBrillo(x: number,y: number,radio: number,colorTinta: number) {
        screen.drawLine(x-radio,y,x+radio,y,colorTinta);screen.drawLine(x,y-radio/3,x,y+radio/3,colorTinta)
        screen.fillRect(x-1,y-1,3,3,1)
    }
    function dibujarRafaga(escenaMs: number,x: number,y: number,cantidad: number) {
        if(esReducido || escenaMs<0 || escenaMs>1400)return
        for(let i=0;i<cantidad;i++) {
            let angulo=i*2.3999,segundos=escenaMs/1000,velocidad=16+i%7*7
            let dx=Math.cos(angulo)*velocidad,dy=Math.sin(angulo)*velocidad
            let chispaX=x+dx*segundos,chispaY=y+dy*segundos+24*segundos*segundos
            screen.drawLine(chispaX,chispaY,chispaX-dx*0.04,chispaY-dy*0.04,escenaMs<450?5:i%3==0?4:13)
        }
    }
    function escenaExterior(escenaMs: number) {
        screen.fill(11)
        let panoramica=esReducido?0:suavizar(escenaMs/4200)*13
        // La luna detrás de bancos de nubes; los edificios lejanos se mueven mucho más despacio.
        screen.fillCircle(123-panoramica/5,29,15,10)
        screen.fillCircle(128-panoramica/5,25,14,11)
        for(let i=0;i<7;i++) {
            let x=i*29-10-panoramica/4,alto=13+i*17%23
            screen.fillRect(x,77-alto,25,alto,8)
            for(let j=0;j<3;j++)screen.fillRect(x+5+j*6,69-alto,2,2,j==1?13:11)
        }
        // Un castillete de mina macizo con riostras cruzadas, un tambor de enrollado y un cable.
        let x=57-panoramica
        screen.fillTriangle(x-28,86,x-6,21,x-1,21,14)
        screen.fillTriangle(x+32,86,x+9,21,x+4,21,14)
        screen.drawLine(x-27,85,x-5,22,10)
        screen.drawLine(x+31,85,x+8,22,10)
        for(let i=0;i<4;i++) {
            let y=30+i*14,ancho=9+i*5
            screen.drawLine(x-ancho,y,x+ancho+4,y+14,10)
            screen.drawLine(x+ancho,y,x-ancho-4,y+14,8)
        }
        screen.fillRect(x-13,18,33,7,8);screen.drawLine(x-13,18,x+19,18,12)
        screen.drawCircle(x+2,18,8,10);screen.drawCircle(x+2,18,5,8)
        screen.drawLine(x+1,25,x+1,87,13);screen.drawLine(x+5,25,x+5,87,10)
        screen.fillRect(95-panoramica,61,65,26,14)
        screen.fillTriangle(89-panoramica,62,116-panoramica,48,151-panoramica,62,8)
        for(let i=0;i<5;i++)screen.fillRect(99-panoramica+i*12,69,5,7,5)
        screen.fillRect(0,87,160,24,15)
        // El hormigón mojado recoge reflejos largos.
        for(let i=0;i<22;i++) {
            let reflejoX=(i*31)%160,reflejoY=90+i*7%18
            screen.drawLine(reflejoX,reflejoY,reflejoX+3+i%8,reflejoY,i%6==0?13:8)
        }
        screen.drawLine(17-panoramica,110,49-panoramica,87,10)
        screen.drawLine(95-panoramica,110,70-panoramica,87,8)
        let hazX=esReducido?30:28+Math.sin(escenaMs/1600)*21
        screen.drawLine(144,77,hazX,12,10);screen.drawLine(145,77,hazX+12,12,8)
        // Siluetas en primer plano pasan por delante de los edificios.
        for(let i=0;i<7;i++) {
            let formaX=i*32-panoramica*2
            screen.fillRect(formaX,83,3,28,14);screen.drawLine(formaX,87,formaX+32,104,8)
        }
        dibujarMotas(escenaMs,32,10)
        dibujarBarrasCine()
        if(escenaMs>700) {rotular("MINA 09",15,1);rotular("23:47 / TURNO DE NOCHE",100,5)}
        // Un iris se abre desde el negro, en vez de iluminar toda la pantalla de golpe.
        let cubierta=esReducido?0:80*(1-suavizar(escenaMs/1000))
        screen.fillRect(0,9,cubierta,102,15);screen.fillRect(160-cubierta,9,cubierta,102,15)
    }
    function escenaLlave(escenaMs: number) {
        screen.fill(15)
        screen.fillRect(13,14,134,95,8)
        screen.drawRect(13,14,134,95,10);screen.drawRect(17,18,126,87,14)
        for(let x=21;x<144;x+=119)for(let y=22;y<105;y+=78) {
            screen.fillCircle(x,y,2,13);screen.drawLine(x-1,y,x+1,y,15)
        }
        screen.fillRect(20,27,74,29,15);screen.drawRect(20,27,74,29,10)
        screen.print("CABINA",23,32,12,fuente)
        screen.print(escenaMs<1100?"BLOQUEADA":"SALIDA",23,44,escenaMs<1100?3:9,fuente)
        screen.drawCircle(111,43,12,14);screen.fillCircle(111,43,9,escenaMs<1100?6:9)
        screen.drawCircle(111,43,6,15)
        screen.drawLine(111,43,111+(escenaMs<1100?-5:5),38,1)
        screen.fillRect(30,64,98,6,15)
        for(let i=0;i<14;i++)screen.fillRect(32+i*7,65,4,4,escenaMs>1100+i*40?5:14)
        // Una mano con guante gira la llave: primero avanza y luego gira.
        let extension=suavizar(escenaMs/900),giro=suavizar((escenaMs-950)/500)
        let manoX=114,manoY=110-extension*26
        screen.fillRect(manoX-11,manoY,30,31,14)
        screen.fillRect(manoX-13,manoY-9,24,17,13)
        for(let i=0;i<4;i++)screen.drawLine(manoX-10+i*5,manoY-7,manoX-10+i*5,manoY+1,8)
        screen.drawLine(111,43,111-giro*10,57,12)
        screen.fillRect(105-giro*8,55,13,4,10)
        dibujarBarrasCine()
        if(escenaMs>1300)mostrarSubtitulo("CONTROL A MANTENIMIENTO:","REVISA EL GENERADOR.")
    }
    function escenaDescenso(escenaMs: number) {
        screen.fill(15)
        let recorrido=esReducido?90:escenaMs/18+escenaMs*escenaMs/180000
        let puntoFugaX=esReducido?80:80+Math.sin(escenaMs/1300)*2,puntoFugaY=47
        // Tres triángulos rellenos dan cuerpo a las paredes del pozo, en vez de simples líneas.
        screen.fillTriangle(0,9,puntoFugaX,puntoFugaY,0,111,8)
        screen.fillTriangle(160,9,puntoFugaX,puntoFugaY,160,111,11)
        screen.fillTriangle(0,9,puntoFugaX,puntoFugaY,160,9,14)
        for(let i=8;i>=0;i--) {
            let profundidad=((i*23+recorrido)%207)/207,ancho=8+190*profundidad*profundidad,alto=ancho*0.65
            let x=puntoFugaX-ancho/2,y=puntoFugaY-alto/2
            screen.drawRect(x,y,ancho,alto,10)
            screen.drawRect(x+2,y+2,ancho-4,alto-4,8)
            screen.drawLine(x,y+alto,x+ancho,y+alto,13)
            screen.fillRect(x+4,y+3,3,2,i%3==0?5:14)
            screen.drawLine(x+4,y+alto-2,x+4,y+alto-6,12)
        }
        for(let i=0;i<4;i++)screen.drawLine(i*53,110,puntoFugaX,puntoFugaY,i%2==0?14:8)
        // Una reja en primer plano, tornillos y una consola fija.
        screen.fillRect(0,9,7,102,14);screen.fillRect(153,9,7,102,14)
        screen.drawLine(7,9,7,110,12);screen.drawLine(152,9,152,110,10)
        for(let i=0;i<8;i++) {
            let x=14+i*19
            screen.fillRect(x,9,2,81,14);screen.drawLine(x+1,10,x+1,89,10)
        }
        screen.fillRect(43,63,74,24,15);screen.drawRect(43,63,74,24,10)
        screen.print("NIVEL",49,68,12,fuente)
        screen.print("-"+Math.min(480,Math.floor(escenaMs*480/7500))+" M",49,77,5,fuente)
        for(let i=0;i<3;i++)screen.fillRect(98+i*5,70,3,3,escenaMs<5500?9:3)
        if(escenaMs>3600 && escenaMs<5700)dibujarRafaga((escenaMs-3600)%1100,147,18,21)
        dibujarBarrasCine()
        if(escenaMs<2600)mostrarSubtitulo("DESPUÉS SUBE OTRA VEZ.","¡ENTENDIDO!")
        if(escenaMs>5700)mostrarSubtitulo("¡UY! ¿QUÉ FUE ESO?","SE FUE LA LUZ.")
    }
    // La nave oscura de escenaNaveOscura. escenaBrummi la vuelve a usar con todas las lámparas del techo apagadas.
    // colorApagado: color de las lámparas apagadas (3 en escenaNaveOscura, 14 en escenaBrummi)
    function dibujarNave(escenaMs: number, colorApagado: number) {
        screen.fill(15)
        screen.fillTriangle(0,9,80,48,0,111,8)
        screen.fillTriangle(160,9,80,48,160,111,11)
        screen.fillTriangle(0,111,80,48,160,111,14)
        for(let i=0;i<7;i++) {
            let tamano=18+i*i*4,x=80-tamano/2,y=48-tamano/3
            screen.drawRect(x,y,tamano,tamano*0.7,escenaMs>1100+i*130?8:10)
            screen.drawLine(x,y+tamano*0.7,x+tamano,y+tamano*0.7,15)
            let encendido=escenaMs<700+(6-i)*210
            screen.fillRect(76,y+3,8,2,encendido?5:colorApagado)
            if(encendido) {
                screen.drawLine(76,y+5,x+5,y+tamano*0.7,10)
                screen.drawLine(84,y+5,x+tamano-5,y+tamano*0.7,10)
            }
        }
        for(let i=0;i<5;i++)screen.drawLine(80,48,i*40,111,8)
        screen.fillRect(6,34,17,10,14);screen.print("09",9,37,12,fuente)
        // cajas de herramientas a la derecha
        if(escenaMs>1800) {
            screen.fillRect(115,86,38,25,8);screen.fillRect(110,81,23,16,13)
            screen.fillRect(102,72,22,13,14);screen.drawLine(103,72,122,72,12)
            screen.fillRect(100,74,3,9,5)
        }
    }
    function escenaNaveOscura(escenaMs: number) {
        dibujarNave(escenaMs,3)
        dibujarRafaga(escenaMs-1000,133,22,28)
        dibujarBarrasCine()
        if(escenaMs>1700)mostrarSubtitulo("FALTAN 5 FUSIBLES.","EL ASCENSOR NO FUNCIONA.")
    }
    // Brummi de cualquier tamaño: la misma construcción que Noche.dibujarRobot (graficos.ts); cada pieza se agranda con
    // escala alrededor de (x, y).
    function dibujarPieza(x: number,y: number,escala: number,dx: number,
        dy: number,ancho: number,alto: number,colorTinta: number) {
        screen.fillRect(Math.round(x+dx*escala),Math.round(y+dy*escala),
            Math.ceil(ancho*escala),Math.ceil(alto*escala),colorTinta)
    }
    function dibujarBrummiGrande(x: number,y: number,escala: number,
        oruga: number,luz: number,brazos: number) {
        // orugas con tacos que se mueven
        dibujarPieza(x,y,escala,-5,3,4,3,14);dibujarPieza(x,y,escala,2,3,4,3,14)
        for(let i=0;i<4;i++)dibujarPieza(x,y,escala,i*2+(i>1?-2:-5)+oruga,4,1,1,10)
        // cuerpo de esquinas redondeadas, sombra, un panelito con dos botones
        dibujarPieza(x,y,escala,-4,-3,9,7,12);dibujarPieza(x,y,escala,-5,-2,11,5,12)
        dibujarPieza(x,y,escala,5,-2,1,5,10);dibujarPieza(x,y,escala,-4,3,9,1,10)
        dibujarPieza(x,y,escala,-2,-1,5,3,14)
        dibujarPieza(x,y,escala,-1,0,1,1,5);dibujarPieza(x,y,escala,1,0,1,1,9)
        // cabeza en cúpula, su luz amarilla, dos lámparas turquesa como ojos y una pequeña sonrisa
        dibujarPieza(x,y,escala,-3,-7,7,4,12)
        dibujarPieza(x,y,escala,-2,-8,5,1,12);dibujarPieza(x,y,escala,3,-6,1,3,10)
        dibujarPieza(x,y,escala,-1,-10,3,2,luz)
        dibujarPieza(x,y,escala,-2,-6,2,2,9);dibujarPieza(x,y,escala,1,-6,2,2,9)
        dibujarPieza(x,y,escala,-2,-6,1,1,1);dibujarPieza(x,y,escala,1,-6,1,1,1)
        dibujarPieza(x,y,escala,-1.5,-4,0.5,0.5,10)
        dibujarPieza(x,y,escala,2,-4,0.5,0.5,10);dibujarPieza(x,y,escala,-1,-3.5,3,0.5,10)
        // pinzas: 0 bajadas, 1 la derecha levantada, 2 las dos levantadas
        if(brazos==0)dibujarPieza(x,y,escala,6,-1,1,3,12)
        else {
            dibujarPieza(x,y,escala,6,-5,1,4,12)
            dibujarPieza(x,y,escala,5,-6,1,1,14)
            dibujarPieza(x,y,escala,7,-6,1,1,14)
        }
        if(brazos==2) {
            dibujarPieza(x,y,escala,-6,-5,1,4,12)
            dibujarPieza(x,y,escala,-7,-6,1,1,14)
            dibujarPieza(x,y,escala,-5,-6,1,1,14)
        }
        else dibujarPieza(x,y,escala,-6,-1,1,3,12)
        if(brazos==0)dibujarPieza(x,y,escala,7,1,1,1,14)
        if(brazos<2)dibujarPieza(x,y,escala,-7,1,1,1,14)
    }
    // escenaBrummi: Brummi se despierta en la nave oscura. Su luz amarilla se enciende suavemente (un circulito crece
    // en 0,7 s). Brummi rueda desde la derecha hasta el centro y crece un poco (de 1,0 a 1,3), levanta las dos pinzas y
    // saluda. Su luz parpadea una vez (un puntito blanco).
    function escenaBrummi(escenaMs: number) {
        dibujarNave(9999,14)
        let rodadura=esReducido?1:suavizar((escenaMs-720)/2180),escala=2.4*(1+0.3*rodadura)
        let x=Math.round(148-68*rodadura),y=Math.round(88-6*escala)
        let resplandor=esReducido?1:limitar(escenaMs/720)
        let brazos=escenaMs<2950?0:escenaMs<3400?2:Math.floor((escenaMs-3400)/400)%2+1
        dibujarBrummiGrande(x,y,escala,rodadura>0 && rodadura<1?Math.floor(escenaMs/150)%2:0,resplandor<1?14:5,brazos)
        if(resplandor<1)screen.fillCircle(x,y-9*escala,Math.round(resplandor*1.4*escala),5)
        if(escenaMs>2790 && escenaMs<3060)screen.fillCircle(x,y-9*escala,2,1)
        dibujarBarrasCine()
        if(escenaMs>630)rotular("¡BIP! ¡BIP! ¡A ORDENAR!",101,12)
    }
    // escenaSalaControl, con la paleta del estudio: la sala de control. El Calliope Hacker está sentado en su mesa
    // (visto de espaldas); él construyó a Brummi. El monitor se enciende sala a sala y muestra el plano de la mina: un
    // punto amarillo, Brummi, devuelve un fusible a su sitio (el recuadro amarillo).
    function escenaSalaControl(escenaMs: number) {
        screen.fill(12)
        screen.fillRect(0,83,160,28,15);screen.drawLine(0,83,159,83,11)
        screen.drawTransparentImage(HACKER,4,44)
        screen.fillRect(82,13,74,60,13);screen.drawRect(82,13,74,60,11)
        screen.fillRect(116,73,6,6,11);screen.fillRect(108,78,22,2,11)
        for(let i=0;i<12;i++) {
            if(!esReducido && escenaMs<i*60)continue
            let columna=i%4,fila=Math.floor(i/4),x=89+columna*15,y=19+fila*13
            if(columna<3)screen.drawLine(x+11,y+4,x+14,y+4,4)
            if(fila<2)screen.drawLine(x+5,y+8,x+5,y+12,4)
            screen.drawRect(x,y,11,8,i==0?2:3)
        }
        if(escenaMs>800) {
            // por la fila de abajo hacia la izquierda (45 px) y luego hacia arriba (26 px)
            let recorrido=suavizar((escenaMs-800)/1500)*71,
                marcaX=139-Math.min(45,recorrido),marcaY=recorrido>45?49-(recorrido-45):49
            screen.fillRect(marcaX-1,marcaY-1,3,3,2);screen.setPixel(marcaX+2,marcaY-2,1)
        }
        screen.fillRect(89,62,3,3,2);screen.print("BRUMMI",95,60,5,fuente)
        dibujarBarrasCine()
        if(escenaMs>900)mostrarSubtitulo("YO CONSTRUÍ A BRUMMI.","LO PONE TODO EN SU LUGAR.")
    }
    // escenaEstudio, la tarjeta «Calliope Hacker presenta», con la paleta del estudio y sus índices fijos (fondo 15,
    // letras 1 con sombra 4 y 13, raya 3, «presenta» 2, brillo 2 con centro 1): el personaje sale de detrás del
    // escenario en 0,4 s, las letras llegan volando, una raya, «presenta», un brillo. Después la tarjeta se cierra
    // suavemente sobre el título, sin saltos.
    function escenaEstudio(escenaMs: number) {
        screen.fill(15)
        if(!esReducido)for(let i=0;i<6;i++) {
            let angulo=escenaMs/2200+i*1.047,dx=Math.cos(angulo)*83,dy=Math.sin(angulo)*43
            screen.fillTriangle(80,43,80+dx,43+dy,80+dx+4,43+dy+3,i%2==0?12:11)
        }
        let subida=esReducido?0:1-suavizar(escenaMs/400)
        screen.drawTransparentImage(HACKER,48,18+Math.round(subida*42))
        // el escenario delante de él, para que salga de detrás subiendo
        screen.fillRect(0,58,160,53,15)
        for(let i=0;i<7;i++)screen.drawLine(80,58,i*27,111,12)
        for(let i=0;i<4;i++)screen.drawLine(10,81+i*i*2,150,81+i*i*2,12)
        // Las letras llegan volando una a una y luego se pueden leer unos cinco segundos.
        const nombreEstudio="CALLIOPE HACKER"
        for(let i=0;i<nombreEstudio.length;i++) {
            let llegada=esReducido?1:suavizar((escenaMs-1500-i*65)/650)
            let x=13+i*9,y=66+(1-llegada)*(i%2==0?-54:58)
            if(escenaMs<1500+i*65 && !esReducido)continue
            dibujarLetraGrande(nombreEstudio.charAt(i),x+2,y+3,1.5,13)
            dibujarLetraGrande(nombreEstudio.charAt(i),x+1,y+1,1.5,4)
            dibujarLetraGrande(nombreEstudio.charAt(i),x,y,1.5,1)
        }
        if(escenaMs>2550) {
            let mitadAncho=59*suavizar((escenaMs-2550)/600)
            screen.drawLine(80-mitadAncho,86,80+mitadAncho,86,3)
            screen.fillRect(77,85,6,3,2)
        }
        if(escenaMs>3200)rotular("presenta",96,2)
        // Un solo brillo que viaja.
        if(!esReducido && escenaMs>3000 && escenaMs<4000)dibujarBrillo(13+(escenaMs-3000)*0.134,64,7,2)
        if(!esReducido && escenaMs>2200)for(let i=0;i<22;i++) {
            let edadChispaMs=(escenaMs-2200+i*191)%2400,fraccion=edadChispaMs/2400
            let x=(i*37)%150+5,y=107-fraccion*88
            screen.setPixel(x,y,i%3==0?3:5)
        }
        // Cerrar suavemente sobre el título; sin un salto brusco de la tarjeta luminosa a la imagen siguiente.
        if(escenaMs>8300) {
            let cubierta=esReducido?0:80*suavizar((escenaMs-8300)/700)
            screen.fillRect(0,9,cubierta,102,15);screen.fillRect(160-cubierta,9,cubierta,102,15)
        }
        dibujarBarrasCine()
    }
    export function dibujar(tiempoPeliculaMs: number,reducido: boolean,fuentePequena: image.Font) {
        fuente=fuentePequena;esReducido=reducido
        if(tiempoPeliculaMs<4200)escenaExterior(tiempoPeliculaMs)
        else if(tiempoPeliculaMs<7000)escenaLlave(tiempoPeliculaMs-4200)
        else if(tiempoPeliculaMs<14500)escenaDescenso(tiempoPeliculaMs-7000)
        else if(tiempoPeliculaMs<18500)escenaNaveOscura(tiempoPeliculaMs-14500)
        else if(tiempoPeliculaMs<23000)escenaBrummi(tiempoPeliculaMs-18500)
        else if(tiempoPeliculaMs<25500)escenaSalaControl(tiempoPeliculaMs-23000)
        else escenaEstudio(tiempoPeliculaMs-25500)
        // El título del juego lo dibuja Noche entre los 34,5 y los 38 s de la película.
    }
}
