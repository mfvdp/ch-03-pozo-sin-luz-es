// Todos los dibujos son pixel art de 160 x 120 píxeles. No se crea ninguna imagen mientras se juega: las dos imágenes
// de pantalla completa (máscara y fondo) se crean una sola vez al empezar.
namespace Noche {
    // La fuente Unicode font8 conserva las tildes, la ñ y los signos ¿ y ¡ del español. Cada letra ocupa seis píxeles.
    let fuentePequena = image.font8
    let mascara = image.create(160,120)
    let mascaraTiempoMs = -999
    let mascaraX = -100
    let mascaraY = -100
    let mascaraSala = -1
    let mascaraDireccion = 99
    let mascaraLuz = false
    let mascaraEscondido = -2
    let fondo = image.create(160,120)
    let fondoSala = -1
    let fondoNumeroMina = -1
    // El nombre del juego, dibujado con las letras de 5 x 7 de cine.ts (Cine.dibujarLetraGrande). Se centra sea cual
    // sea su longitud, pero con más de 12 letras se sale del marco.
    export const NOMBRE_JUEGO = "POZO SIN LUZ"
    function dibujarLogo(y: number, visibles: number) {
        let cantidad=NOMBRE_JUEGO.length,x0=Math.floor((160-(cantidad*12-2))/2)
        for(let i=0;i<Math.min(cantidad,visibles);i++) {
            Cine.dibujarLetraGrande(NOMBRE_JUEGO.charAt(i),x0+1+i*12,y+2,2,6)
            Cine.dibujarLetraGrande(NOMBRE_JUEGO.charAt(i),x0+i*12,y,2,1)
            if(NOMBRE_JUEGO.charAt(i)!=" ")screen.setPixel(x0+2+i*12,y+3,12)
        }
        screen.drawLine(x0+6,y+19,x0+cantidad*12-9,y+19,10)
        screen.fillRect(69,y+18,22,3,5)
    }
    function escribir(texto: string,x: number,y: number,colorTexto: number) {
        screen.print(texto,x,y,colorTexto,fuentePequena)
    }
    function escribirCentrado(texto: string,y: number,colorTexto: number) {
        escribir(texto,Math.floor((160-texto.length*6)/2),y,colorTexto)
    }
    // Dibujitos en lugar de letras, que miden como máximo 7 píxeles de alto.
    // Tamaños: fusible 7 x 5, bolsa 7 x 7, silbato 8 x 6, puerta 5 x 7, enchufe del generador 9 x 7.
    // Un fusible tal como está tirado en la mina: tapas marrones, cuerpo amarillo, centro blanco.
    function dibujarIconoFusible(x: number,y: number) {
        screen.fillRect(x,y+1,7,5,13);screen.fillRect(x+1,y+2,5,3,5);screen.drawLine(x+3,y+1,x+3,y+5,1)
    }
    // Un fusible en el generador (instalado): enchufe gris, ranura oscura, fusible amarillo, luz turquesa.
    function dibujarIconoInstalado(x: number,y: number) {
        screen.fillRect(x,y,9,7,10);screen.fillRect(x+1,y+1,7,5,14)
        screen.fillRect(x+2,y+2,5,3,5);screen.setPixel(x+4,y+3,1);screen.setPixel(x+7,y+1,9)
    }
    // La bolsa (fusibles que se llevan): un asa y una bolsa clara con solapa.
    function dibujarIconoBolsa(x: number,y: number) {
        screen.drawLine(x+2,y,x+4,y,12);screen.setPixel(x+1,y+1,12);screen.setPixel(x+5,y+1,12)
        screen.fillRect(x,y+2,7,5,12);screen.drawLine(x+1,y+3,x+5,y+3,13)
    }
    // El silbato (tiempo hasta que vuelve a estar listo): boquilla y cuerpo redondo con un agujero.
    function dibujarIconoSilbato(x: number,y: number) {
        screen.fillRect(x,y+2,3,2,12);screen.fillCircle(x+5,y+3,2,12)
        screen.setPixel(x+5,y+3,15);screen.setPixel(x+7,y,10)
    }
    // Una puerta (la salida junto al ascensor): marco y pomo.
    function dibujarIconoPuerta(x: number,y: number,colorDibujo: number) {
        screen.drawRect(x,y,5,7,colorDibujo);screen.setPixel(x+3,y+4,colorDibujo)
    }
    function dibujarBarras(alto: number) {
        screen.fillRect(0,0,160,alto,15)
        screen.fillRect(0,120-alto,160,alto,15)
    }
    function dibujarLluvia(escenaMs: number,cantidad: number) {
        for(let i=0;i<cantidad;i++) {
            let x=(i*29+Math.floor(escenaMs/60))%178-9,y=(i*47+Math.floor(escenaMs/(i%3+5)))%130-8
            screen.drawLine(x,y,x-3,y+7,i%4==0?10:8)
        }
    }
    function dibujarEdificios(escenaMs: number) {
        screen.fill(11)
        screen.fillCircle(123,30,14,8);screen.fillCircle(127,26,14,11)
        for(let i=0;i<8;i++) {
            let x=i*24-12,alto=12+(i*19)%24
            screen.fillRect(x,78-alto,23,alto,8)
            screen.fillRect(x+4,70-alto,5,8,8)
        }
        // Ventanas iluminadas a lo lejos y tejados de fábrica en escalera.
        for(let i=0;i<19;i++) {
            let x=(i*23+7)%158,y=57+(i*11)%18
            screen.fillRect(x,y,2,2,i%5==0?13:11)
        }
        screen.fillRect(0,78,160,42,15)
        // Castillete de la mina, polea, diagonales de acero y la caseta del cabrestante.
        screen.drawLine(37,82,52,22,10);screen.drawLine(39,82,54,22,8)
        screen.drawLine(86,82,69,22,10);screen.drawLine(84,82,67,22,8)
        screen.fillRect(48,19,25,5,14);screen.drawCircle(60,18,7,10)
        screen.drawLine(49,32,75,49,8);screen.drawLine(73,32,45,49,8)
        screen.drawLine(45,49,80,67,8);screen.drawLine(76,49,40,67,8)
        screen.drawLine(60,19,60,88,10);screen.drawLine(64,19,64,88,8)
        screen.fillRect(99,67,47,16,14);screen.fillRect(112,59,21,9,14)
        for(let i=0;i<4;i++)screen.fillRect(104+i*10,71,4,4,Math.floor(escenaMs/500)%11==0?13:5)
        screen.fillRect(42,82,45,4,13)
        screen.drawLine(0,84,159,84,8)
        screen.drawLine(28,118,51,86,8);screen.drawLine(94,118,74,86,8)
        screen.drawLine(32,118,54,86,14);screen.drawLine(90,118,71,86,14)
        for(let i=0;i<5;i++) {
            let y=90+i*i
            screen.drawLine(48-i*4,y,77+i*4,y,11)
        }
        screen.drawLine(151,43,151,82,10)
        screen.fillRect(147,42,9,2,5)
        screen.drawLine(151,45,136,81,11);screen.drawLine(151,45,159,73,11)
        // Carretera mojada, niebla baja que se desplaza y reflejos de luces de servicio.
        for(let i=0;i<14;i++) {
            let x=(i*31+Math.floor(escenaMs/130))%180-20,y=85+(i*7)%25
            screen.drawLine(x,y,x+10+i%9,y,i%4==0?10:11)
        }
        dibujarLluvia(escenaMs,38)
    }
    function dibujarLlegadaTitulo(escenaMs: number) {
        screen.fill(15)
        if(!reducido)for(let i=0;i<26;i++) {
            let recorridoRaya=(escenaMs/12+i*17)%160
            let dx=(i*31%101)-50,dy=(i*43%71)-35
            let x=80+dx*recorridoRaya/50,y=55+dy*recorridoRaya/50
            screen.drawLine(x,y,x+dx*0.08,y+dy*0.08,escenaMs<1100?10:11)
        }
        // El título grande cae a su sitio letra a letra (sin caída con los efectos reducidos); después, una línea clara
        // corre por debajo de izquierda a derecha.
        let asentamiento=reducido?0:Math.max(0,1-escenaMs/650)
        let y=43-Math.floor(asentamiento*asentamiento*24)
        dibujarLogo(y,Math.floor(escenaMs/75))
        if(escenaMs>850) {
            screen.drawLine(15,68,144,68,8)
            let barrido=Math.min(130,(escenaMs-850)/4)
            screen.drawLine(15,68,15+barrido,68,13)
        }
        if(escenaMs>1000)escribirCentrado("¡BUSCA 5 FUSIBLES!",79,5)
        if(escenaMs>1400)escribirCentrado("COMIENZA TU TURNO.",96,12)
        dibujarBarras(10)
    }
    function dibujarIntro() {
        let tiempoPeliculaMs=tiempoPeliculaIntroMs(edadMs)
        if(tiempoPeliculaMs>=34500)dibujarLlegadaTitulo(tiempoPeliculaMs-34500)
        else Cine.dibujar(tiempoPeliculaMs,reducido,fuentePequena)
        // Pie de pantalla: un juego de colores para cada paleta (el color 13 sería negro sobre negro con la
        // paleta del estudio).
        let estudio=Cine.esPaletaEstudio()
        escribirCentrado("A/B: SALTAR",112,estudio?11:10)
        screen.fillRect(0,119,Math.min(160,edadMs*160/duracionIntroMs),1,estudio?11:13)
    }
    function dibujarTitulo() {
        dibujarEdificios(edadMs+4000)
        // Un solo panel rodea todas las filas, con sitio para resaltar la fila elegida.
        screen.fillRect(4,19,152,91,15)
        screen.drawRect(4,19,152,91,10)
        screen.drawRect(6,21,148,87,8)
        for(let x=8;x<154;x+=144) {
            screen.setPixel(x,23,12);screen.setPixel(x,105,10)
        }
        dibujarLogo(28,NOMBRE_JUEGO.length)
        escribirCentrado("5 FUSIBLES. 1 ROBOT.",53,12)
        for(let i=0;i<4;i++) {
            let y=63+i*9
            if(menu==i) screen.fillRect(12,y-1,136,9,8)
            let rotulo=i==0?"EMPEZAR TURNO":i==1?"PRÁCTICA":
                i==2?(reducido?"EFECTOS: REDUCIDOS":"EFECTOS: CINE"):
                (mudo?"SONIDO: NO":"SONIDO: SÍ")
            escribir(rotulo,28,y,menu==i?1:10)
            if(menu==i)escribir(">",17,y,5)
        }
        screen.fillRect(0,112,160,8,15)
        escribirCentrado("DIRECCIÓN: ELEGIR  A: OK",112,10)

        escribirCentrado("BAJO TIERRA / -480 M",10,12)
    }
    function dibujarOfertaPractica() {
        screen.fill(15)
        screen.drawLine(12,18,147,18,10)
        escribirCentrado("REGISTRO DE REVISIÓN / 09",9,5)
        escribirCentrado("ANTES DE BAJAR",30,1)
        escribirCentrado("Luz, silbato y Brummi.",46,12)
        escribirCentrado("Aprende sin peligro.",56,12)
        screen.fillRect(15,73,130,13,8);escribirCentrado("A  EMPEZAR PRÁCTICA",77,1)
        escribirCentrado("B  IR DIRECTO AL TURNO",96,5)
        escribirCentrado("La práctica es opcional.",112,10)
    }
    // Monitor de la sala de control en el ascensor: el Calliope Hacker, de espaldas en su mesa, con la capucha puesta,
    // sudadera negra con un borde claro, silla y zapatillas turquesa. La pantalla brilla: dibujarOscuridad() deja un
    // agujero en la máscara en ese punto, así se ve desde el primer segundo de cada noche y de la práctica.
    export const MONITOR_X = 9
    export const MONITOR_Y = 81
    function dibujarMonitorControl() {
        let x=MONITOR_X,y=MONITOR_Y
        fondo.fillRect(x,y,26,18,14);fondo.drawRect(x,y,26,18,10);fondo.fillRect(x+10,y+18,6,2,13)
        fondo.fillRect(x+2,y+2,22,14,10)
        // su propia pantalla sobre la mesa, con un punto amarillo: Brummi en el plano de la mina
        fondo.fillRect(x+13,y+3,9,6,8);fondo.fillRect(x+14,y+4,7,4,9);fondo.setPixel(x+17,y+5,5)
        fondo.fillRect(x+2,y+10,22,2,13)
        // capucha y sudadera en negro (15) con un borde claro (12)
        fondo.drawLine(x+7,y+3,x+8,y+3,15)
        fondo.fillRect(x+6,y+4,4,4,15);fondo.fillRect(x+5,y+8,7,6,15)
        fondo.setPixel(x+6,y+3,12);fondo.drawLine(x+5,y+4,x+5,y+7,12)
        fondo.drawLine(x+4,y+8,x+4,y+13,12)
        fondo.fillRect(x+11,y+9,3,2,15)
        // silla y zapatillas en turquesa (9)
        fondo.drawLine(x+4,y+14,x+12,y+14,9);fondo.setPixel(x+5,y+15,9);fondo.setPixel(x+11,y+15,9)
    }
    // Decorado de una sala, guardado en memoria. Su forma coincide exactamente con las baldosas de colisión.
    function dibujarDecoradoSala() {
        fondo.fill(15)
        let datosSala=salas[sala]
        for(let y=0;y<15;y++)for(let x=0;x<20;x++) {
            let tipoBaldosa=datosSala.baldosas.getUint8(y*20+x),pixelX=x*8,pixelY=y*8
            if(tipoBaldosa==1) {
                fondo.fillRect(pixelX,pixelY,8,8,14)
                fondo.drawLine(pixelX,pixelY,pixelX+7,pixelY,10)
                fondo.drawLine(pixelX,pixelY,pixelX,pixelY+7,8)
                fondo.drawLine(pixelX+1,pixelY+6,pixelX+7,pixelY+6,11)
                fondo.setPixel(pixelX+2,pixelY+2,12)
                if(!esMuro(sala,x,y+1)) {
                    fondo.fillRect(pixelX,pixelY+4,8,4,8)
                    fondo.drawLine(pixelX,pixelY+4,pixelX+7,pixelY+4,10)
                    fondo.drawLine(pixelX,pixelY+7,pixelX+7,pixelY+7,15)
                }
                if(!esMuro(sala,x+1,y))fondo.drawLine(pixelX+7,pixelY,pixelX+7,pixelY+7,15)
            } else {
                fondo.fillRect(pixelX,pixelY,8,8,(x+y)%2==0?11:15)
                fondo.drawLine(pixelX,pixelY,pixelX+7,pixelY,8)
                fondo.setPixel(pixelX+1,pixelY+1,14)
                if((x*13+y*7+sala)%5==0) {
                    fondo.drawLine(pixelX+3,pixelY+5,pixelX+6,pixelY+5,14)
                    fondo.setPixel(pixelX+2,pixelY+6,8)
                }
                if(esMuro(sala,x,y-1))fondo.fillRect(pixelX,pixelY,8,2,15)
                if(tipoBaldosa==2) {
                    fondo.fillRect(pixelX+1,pixelY+3,6,3,15)
                    fondo.drawLine(pixelX+1,pixelY+2,pixelX+6,pixelY+5,13)
                    fondo.drawLine(pixelX+3,pixelY+6,pixelX+5,pixelY+1,4)
                    fondo.setPixel(pixelX+2,pixelY+2,12)
                }
                if(tipoBaldosa==3) {
                    fondo.fillRect(pixelX,pixelY,8,8,8)
                    fondo.drawLine(pixelX+1,pixelY+2,pixelX+5,pixelY+2,10)
                    fondo.drawLine(pixelX+3,pixelY+5,pixelX+7,pixelY+5,9)
                    fondo.setPixel(pixelX+1,pixelY+6,7)
                }
            }
        }
        // Tuberías de servicio en el techo, abrazaderas y un letrero con el número de la sala.
        fondo.fillRect(12,12,136,5,15)
        fondo.fillRect(12,12,136,3,10)
        fondo.drawLine(12,12,147,12,12)
        for(let x=16;x<146;x+=22) {
            fondo.fillRect(x,11,3,5,14);fondo.setPixel(x+1,12,13)
        }
        fondo.fillRect(118,18,27,10,15)
        fondo.drawRect(118,18,27,10,8)
        fondo.print((sala<10?"0":"")+sala,124,21,10,fuentePequena)
        // Siluetas distintas para cada familia de salas.
        if(datosSala.tipo==TipoSala.Generador || datosSala.tipo==TipoSala.Ascensor) {
            fondo.fillRect(57,37,40,31,8)
            fondo.drawRect(57,37,40,31,10)
            for(let x=58;x<97;x+=6) {
                fondo.drawLine(x,37,x+3,40,5)
                fondo.drawLine(x,64,x+3,67,4)
            }
            if(datosSala.tipo==TipoSala.Ascensor) {
                fondo.fillRect(61,42,32,21,15)
                for(let x=63;x<92;x+=5)fondo.drawLine(x,43,x,61,10)
                fondo.drawLine(77,42,77,62,12)
                fondo.fillRect(97,45,5,12,14);fondo.setPixel(99,48,9)
                dibujarMonitorControl()
            } else {
                fondo.drawLine(76,37,76,19,13)
                fondo.drawLine(78,37,78,19,4)
                fondo.fillRect(60,70,33,6,15)
                for(let x=62;x<91;x+=3)fondo.drawLine(x,71,x,74,10)
            }
        }
        if(datosSala.tipo==TipoSala.Taller || datosSala.tipo==TipoSala.Almacen) {
            fondo.fillRect(13,88,13,17,15)
            fondo.fillRect(12,86,13,16,13)
            fondo.drawRect(12,86,13,16,10)
            fondo.drawLine(14,88,22,99,14);fondo.drawLine(22,88,14,99,14)
            fondo.drawLine(12,86,24,86,12)
            fondo.fillRect(130,96,14,9,8)
            for(let x=132;x<143;x+=3)fondo.drawLine(x,97,x,103,10)
        }
        if(datosSala.tipo==TipoSala.Nave) {
            fondo.fillRect(88,18,7,26,15)
            fondo.drawLine(90,18,90,41,13);fondo.drawLine(92,18,92,41,10)
            fondo.drawCircle(93,43,4,13);fondo.fillRect(94,38,4,4,11)
            fondo.drawLine(12,94,147,94,8);fondo.drawLine(12,97,147,97,14)
        }
        if(datosSala.tipo==TipoSala.EstacionCarga) {
            // Estación de carga: una base bajo el sitio de aparcamiento de Brummi (116, 60), un poste de carga con una
            // lámpara amarilla, un cable hasta la pared y un cartel con la cabeza de Brummi.
            fondo.fillRect(106,64,21,5,13);fondo.drawLine(106,64,126,64,12)
            fondo.drawLine(107,68,125,68,14)
            fondo.fillRect(130,44,6,25,10);fondo.drawLine(130,44,135,44,12)
            fondo.drawLine(135,45,135,68,14)
            fondo.fillRect(131,47,4,3,5);fondo.fillRect(131,53,4,8,14)
            fondo.setPixel(132,55,9);fondo.setPixel(132,58,9)
            fondo.drawLine(126,66,129,66,14)
            fondo.drawLine(136,50,151,50,14);fondo.drawLine(136,51,151,51,8)
            fondo.fillRect(96,36,15,12,14);fondo.drawRect(96,36,15,12,10)
            fondo.fillRect(100,40,7,5,12);fondo.setPixel(103,38,5);fondo.setPixel(103,39,10)
            fondo.setPixel(101,42,9);fondo.setPixel(105,42,9);fondo.drawLine(102,44,104,44,10)
        }
        for(let direccion=0;direccion<4;direccion++)if(datosSala.puertas[direccion]>=0) {
            let x=direccion==0?150:direccion==2?6:73,y=direccion==1?108:direccion==3?6:57
            if(direccion%2==0) {
                fondo.fillRect(x,y-3,4,3,10);fondo.fillRect(x,y+15,4,3,10)
                fondo.drawLine(x+1,y,x+1,y+13,13)
            } else {
                fondo.fillRect(x-3,y,3,4,10);fondo.fillRect(x+15,y,3,4,10)
                fondo.drawLine(x,y+1,x+13,y+1,13)
            }
        }
    }
    function dibujarCosa(cosa: Cosa) {
        let x=Math.floor(cosa.x),y=Math.floor(cosa.y)
        screen.fillRect(x-5,y+4,12,3,15)
        if(cosa.tipo==TipoCosa.Fusible) {
            screen.fillRect(x-4,y-3,9,7,13)
            screen.fillRect(x-3,y-2,7,5,5)
            screen.fillRect(x-1,y-3,3,7,1)
            screen.drawLine(x-1,y,x+1,y,9)
            screen.setPixel(x-4,y-3,12);screen.setPixel(x+4,y+3,4)
        } else if(cosa.tipo==TipoCosa.Bateria) {
            screen.fillRect(x-4,y-4,8,9,8)
            screen.fillRect(x-3,y-4,6,8,7)
            screen.drawLine(x-3,y-4,x+2,y-4,1)
            screen.fillRect(x-1,y-6,2,2,12)
            screen.drawLine(x-1,y-1,x+1,y-1,1);screen.drawLine(x,y-2,x,y,1)
            screen.drawLine(x-3,y+3,x+2,y+3,10)
        } else if(cosa.tipo==TipoCosa.Taquilla) {
            screen.fillRect(x-6,y-8,13,17,15)
            screen.fillRect(x-6,y-8,11,15,10)
            screen.drawLine(x-6,y-8,x+4,y-8,12)
            screen.fillRect(x+4,y-7,2,14,8)
            screen.drawRect(x-4,y-6,7,12,8)
            for(let linea=0;linea<3;linea++)screen.drawLine(x-3,y-4+linea*2,x+1,y-4+linea*2,15)
            screen.setPixel(x+1,y+3,5);screen.setPixel(x+2,y+3,4)
            screen.fillRect(x-5,y+7,2,2,13);screen.fillRect(x+3,y+7,2,2,13)
        } else if(cosa.tipo==TipoCosa.Generador) {
            screen.fillRect(x-9,y-8,19,17,15)
            screen.fillRect(x-9,y-8,17,14,10)
            screen.drawLine(x-8,y-8,x+7,y-8,12)
            screen.fillRect(x-7,y-6,14,10,8)
            screen.fillRect(x+8,y-6,2,13,14)
            for(let i=0;i<5;i++) {
                screen.fillRect(x-6+i*3,y-4,2,4,i<instalados?9:13)
                if(i<instalados)screen.setPixel(x-6+i*3,y-4,1)
            }
            screen.drawLine(x-5,y+3,x+4,y+3,instalados==5?9:4)
            screen.fillRect(x-6,y+6,3,3,13);screen.fillRect(x+4,y+6,3,3,13)
            screen.setPixel(x-8,y-6,5);screen.setPixel(x-8,y+4,12)
        }
    }
    function dibujarPersonaje() {
        if(taquillaEscondida>=0)return
        dibujarPersonajeEn(Math.floor(personajeX),Math.floor(personajeY),
            orientacionX,orientacionY,lampara,Math.floor((personajeX+personajeY)/3)%2)
    }
    function dibujarPersonajeEn(x: number,y: number,orientacionX: number,
        orientacionY: number,lampara: boolean,fasePiernas: number) {
        screen.fillRect(x-4,y+4,9,3,15)
        screen.fillRect(x-2,y+2,2,3+fasePiernas,8);screen.fillRect(x+1,y+2,2,4-fasePiernas,8)
        screen.setPixel(x-2,y+5+fasePiernas,13);screen.setPixel(x+2,y+6-fasePiernas,13)
        screen.fillRect(x-3,y-2,7,5,10)
        screen.drawLine(x-2,y,x+2,y,5)
        screen.fillRect(x-1,y-3,3,3,13)
        screen.fillRect(x-3,y-6,6,4,4)
        screen.fillRect(x-2,y-6,4,2,5)
        screen.drawLine(x-3,y-3,x+3,y-3,5)
        screen.setPixel(x-1,y-5,1)
        let posicionLamparaX=x+Math.round(orientacionX*4),posicionLamparaY=y+Math.round(orientacionY*4)
        screen.fillRect(posicionLamparaX-1,posicionLamparaY-1,3,3,13)
        screen.setPixel(posicionLamparaX+Math.round(orientacionX),
            posicionLamparaY+Math.round(orientacionY),lampara?1:12)
    }
    // Pequeñas señales sobre Brummi, de 3 x 5 píxeles, fila a fila: ? ! z y una nota.
    const SIMBOLOS = ["111001010000010", "010010010000010", "111001010100111", "011010010110110"]
    function dibujarSimbolo(numero: number,x: number,y: number) {
        let patron=SIMBOLOS[numero]
        for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(patron.charAt(j*3+i)=="1")screen.setPixel(x+i,y+j,5)
    }
    // Brummi, el robot de mantenimiento: cuerpo claro de esquinas redondeadas, cabeza en cúpula con dos ojos-lámpara
    // turquesa, antena con una luz amarilla, dos orugas y dos pinzas. Nunca en los colores 2, 3 o 6.
    // x, y: centro del cuerpo; la imagen va de x-7 a x+7 (x+8 con el fusible en la mano) y de y-10 a y+5;
    // las señales van de x-8 a x+9 y suben hasta y-19 (la segunda z en la estación de carga).
    // luz: color de la luz de la antena (5 amarillo, 1 mientras pita, 13 tenue en la estación de carga).
    // brazos: 0 bajados, 1 pinza derecha levantada con un fusible, 2 las dos levantadas (baila, saluda).
    export function dibujarRobot(x: number,y: number,comportamiento: number,
        oruga: number,luz: number,brazos: number) {
        // orugas
        screen.fillRect(x-5,y+3,4,3,14);screen.fillRect(x+2,y+3,4,3,14)
        screen.setPixel(x-5+oruga,y+4,10);screen.setPixel(x-3+oruga,y+4,10)
        screen.setPixel(x+2+oruga,y+4,10);screen.setPixel(x+4+oruga,y+4,10)
        // cuerpo de esquinas redondeadas, sombra a la derecha y abajo, un panelito con dos botones
        screen.fillRect(x-4,y-3,9,7,12);screen.fillRect(x-5,y-2,11,5,12)
        screen.drawLine(x+5,y-2,x+5,y+2,10);screen.drawLine(x-4,y+3,x+4,y+3,10)
        screen.fillRect(x-2,y-1,5,3,14);screen.setPixel(x-1,y,5);screen.setPixel(x+1,y,9)
        // cabeza en cúpula, antena y luz
        screen.fillRect(x-3,y-7,7,4,12);screen.fillRect(x-2,y-8,5,1,12);screen.drawLine(x+3,y-6,x+3,y-4,10)
        screen.fillRect(x-1,y-10,3,2,luz)
        // ojos: dos lámparas turquesa; Brummi mira a su alrededor mientras busca y casi los cierra en la
        // estación de carga
        let desplazamientoOjos=comportamiento==Comportamiento.Mirar?(Math.floor(transcurridoMs/500)%2)*2-1:0
        if(comportamiento==Comportamiento.EstacionCarga) {
            screen.drawLine(x-2,y-5,x-1,y-5,10)
            screen.drawLine(x+1,y-5,x+2,y-5,10)
        }
        else {
            screen.fillRect(x-2+desplazamientoOjos,y-6,2,2,9);screen.fillRect(x+1+desplazamientoOjos,y-6,2,2,9)
            screen.setPixel(x-2+desplazamientoOjos,y-6,1);screen.setPixel(x+1+desplazamientoOjos,y-6,1)
        }
        screen.drawLine(x-1,y-4,x+1,y-4,10)
        // pinzas
        if(brazos==0) {
            screen.drawLine(x-6,y-1,x-6,y+1,12);screen.setPixel(x-7,y+1,14)
            screen.drawLine(x+6,y-1,x+6,y+1,12);screen.setPixel(x+7,y+1,14)
        } else {
            screen.drawLine(x+6,y-2,x+6,y-5,12);screen.setPixel(x+5,y-6,14);screen.setPixel(x+7,y-6,14)
            if(brazos==2) {
                screen.drawLine(x-6,y-2,x-6,y-5,12)
                screen.setPixel(x-7,y-6,14);screen.setPixel(x-5,y-6,14)
            }
            else {
                screen.drawLine(x-6,y-1,x-6,y+1,12);screen.setPixel(x-7,y+1,14)
                // el fusible que devuelve, sujeto encima de la pinza derecha
                screen.fillRect(x+4,y-10,5,4,13);screen.fillRect(x+5,y-9,3,2,5);screen.setPixel(x+6,y-10,1)
            }
        }
        // lo que está haciendo: ? curioso, ! quiere ordenar, ... busca, dos notas escucha, z se carga
        if(comportamiento==Comportamiento.Curioso)dibujarSimbolo(0,x-1,y-16)
        else if(comportamiento==Comportamiento.Seguir)dibujarSimbolo(1,x-1,y-16)
        else if(comportamiento==Comportamiento.Mirar) {
            screen.setPixel(x-3,y-13,5);screen.setPixel(x,y-13,5);screen.setPixel(x+3,y-13,5)
        }
        else if(comportamiento==Comportamiento.Escuchar) {
            let arriba=Math.floor(transcurridoMs/250)%2
            dibujarSimbolo(3,x-8,y-15+arriba)
            dibujarSimbolo(3,x+5,y-14-arriba)
        }
        else if(comportamiento==Comportamiento.EstacionCarga) {
            dibujarSimbolo(2,x+4,y-14)
            if(Math.floor(transcurridoMs/1000)%2==0)dibujarSimbolo(2,x+7,y-19)
        }
    }
    // Brummi en el mundo: se dibuja después de dibujarOscuridad(), así que nunca queda oculto. Donde la luz del
    // personaje no lo alcanza, un halo suave (círculo de color 8, gris azulado oscuro) lo muestra, incluso detrás
    // de las paredes.
    function dibujarBrummiEnMundo() {
        if(brummi.sala!=sala)return
        let comportamiento=brummi.comportamiento,x=Math.floor(brummi.x),y=Math.floor(brummi.y)
        if(comportamiento==Comportamiento.Escuchar)x+=Math.floor(transcurridoMs/250)%2
        if(!esVisible(brummi.x,brummi.y)) {
            screen.fillCircle(x,y-2,9,8)
            // dejar al personaje delante del halo cuando están cerca
            if(Math.abs(personajeX-brummi.x)<17 && Math.abs(personajeY-brummi.y)<17)dibujarPersonaje()
        }
        let luz=comportamiento==Comportamiento.EstacionCarga?13:destelloPitidoMs>0 && estado==Estado.Partida?1:5
        dibujarRobot(x,y,comportamiento,comportamiento==Comportamiento.Escuchar
            || comportamiento==Comportamiento.EstacionCarga?0:Math.floor((brummi.x+brummi.y)/3)%2,luz,
            comportamiento==Comportamiento.Devolver && brummi.numeroFusible>=0
                ?1:comportamiento==Comportamiento.Escuchar?2:0)
    }
    // Antena del panel: dos arcos, amarillos mientras Brummi pita.
    function dibujarAntena(x: number,y: number,pita: boolean) {
        let colorTinta=pita?5:10
        screen.fillRect(x-1,y,3,2,pita?5:12);screen.drawLine(x,y+2,x,y+7,10);screen.drawLine(x-2,y+8,x+2,y+8,10)
        screen.setPixel(x-3,y,colorTinta);screen.drawLine(x-4,y+1,x-4,y+3,colorTinta)
        screen.setPixel(x-3,y+4,colorTinta)
        screen.setPixel(x+3,y,colorTinta);screen.drawLine(x+4,y+1,x+4,y+3,colorTinta)
        screen.setPixel(x+3,y+4,colorTinta)
        if(pita) {screen.drawLine(x-6,y,x-6,y+4,5);screen.drawLine(x+6,y,x+6,y+4,5)}
    }
    // Barra de curiosidad: Brummi se fija en un personaje que lleva un fusible (marco 10, relleno amarillo).
    function dibujarBarraCuriosidad(x: number,y: number) {
        screen.drawRect(x,y,40,4,10);screen.fillRect(x+1,y+1,38*Math.min(1,brummi.vistoMs/600),2,5)
    }
    // Un abanico de rayos cortos recortados por las paredes da bordes de luz suaves. Los rellenos de triángulos del
    // sistema evitan recorrer todos los píxeles de la pantalla en TypeScript.
    function recortarAbanicoLuz(radio: number, segmentos: number, lleno: boolean) {
        let ultimaX=personajeX,ultimaY=personajeY
        for(let i=0;i<=segmentos;i++) {
            let angulo=lleno?i*Math.PI*2/segmentos:-Math.PI/6+i*Math.PI/3/segmentos
            let cosAngulo=Math.cos(angulo),senAngulo=Math.sin(angulo)
            let dx=lleno?cosAngulo:orientacionX*cosAngulo-orientacionY*senAngulo,
                dy=lleno?senAngulo:orientacionY*cosAngulo+orientacionX*senAngulo
            let finX=personajeX,finY=personajeY
            for(let distancia=2;distancia<=radio;distancia+=2) {
                finX=personajeX+dx*distancia;finY=personajeY+dy*distancia
                if(esMuro(sala,Math.floor(finX/8),Math.floor(finY/8)))break
            }
            if(i>0)mascara.fillTriangle(personajeX,personajeY,ultimaX,ultimaY,finX,finY,0)
            ultimaX=finX;ultimaY=finY
        }
    }
    function dibujarOscuridad() {
        let direccion=Math.round(orientacionX*10)+Math.round(orientacionY*10)*30
        let luz=lampara
        if(mascaraSala!=sala || mascaraX!=personajeX || mascaraY!=personajeY || mascaraDireccion!=direccion
            || mascaraLuz!=luz || mascaraEscondido!=taquillaEscondida) {
            if(transcurridoMs-mascaraTiempoMs>=40 || mascaraSala!=sala
                || mascaraLuz!=luz || mascaraEscondido!=taquillaEscondida) {
                mascara.fill(15)
                for(let y=0;y<15;y++)for(let x=0;x<20;x++) {
                    let pixelX=x*8,pixelY=y*8
                    if(esMuro(sala,x,y)) {
                        mascara.fillRect(pixelX,pixelY,8,7,11)
                        if(!esMuro(sala,x,y+1))mascara.drawLine(pixelX,pixelY+4,pixelX+7,pixelY+4,8)
                    } else if((x+y)%2==0)mascara.drawLine(pixelX,pixelY,pixelX+7,pixelY,11)
                    if(taquillaEscondida>=0 && esVisible(pixelX+4,pixelY+4))mascara.fillRect(pixelX,pixelY,8,8,0)
                }
                // El monitor de la sala de control, en el ascensor, brilla.
                if(sala==0)mascara.fillRect(MONITOR_X,MONITOR_Y,26,20,0)
                if(taquillaEscondida<0) {
                    recortarAbanicoLuz(12,16,true)
                    if(luz)recortarAbanicoLuz(64,32,false)
                }
                mascaraX=personajeX;mascaraY=personajeY;mascaraDireccion=direccion;mascaraSala=sala
                mascaraLuz=luz;mascaraEscondido=taquillaEscondida;mascaraTiempoMs=transcurridoMs
            }
        }
        screen.drawTransparentImage(mascara,0,0)
    }
    function dibujarFlecha(x: number,y: number,direccion: number,colorDibujo: number) {
        if(direccion==0 || direccion==2) {
            let signo=direccion==0?1:-1
            screen.drawLine(x-3*signo,y,x+3*signo,y,colorDibujo)
            screen.drawLine(x,y-3,x+3*signo,y,colorDibujo);screen.drawLine(x,y+3,x+3*signo,y,colorDibujo)
        } else {
            let signo=direccion==1?1:-1
            screen.drawLine(x,y-3*signo,x,y+3*signo,colorDibujo)
            screen.drawLine(x-3,y,x,y+3*signo,colorDibujo);screen.drawLine(x+3,y,x,y+3*signo,colorDibujo)
        }
    }
    function dibujarSenales() {
        let siguiente=proximaSala(sala,instalados>=5?0:4,true)
        for(let direccion=0;direccion<4;direccion++) {
            let salaVecina=salas[sala].puertas[direccion]
            if(salaVecina<0)continue
            let x=direccion==0?151:direccion==2?8:79,y=direccion==1?102:direccion==3?18:63
            if(instalados>=5 || sala==0 || sala==1 || salas[salaVecina].visitada) {
                dibujarFlecha(x,y,direccion,salaVecina==siguiente?5:10)
                if(salaVecina==siguiente && (instalados>=5 || sala==0 || sala==1)) {
                    // Debajo de la flecha, salvo en la puerta de abajo: ahí la señal va al lado de la flecha, para que
                    // la barra inferior de la pantalla no la tape.
                    let senalX=direccion==1?x+5:x-2,senalY=direccion==1?y-3:y+6
                    if(instalados>=5)dibujarIconoPuerta(senalX,senalY,5)
                    else escribir("G",senalX,senalY,5)
                }
            }
        }
    }
    function dibujarBandaPractica() {
        screen.fillRect(0,0,160,24,15)
        screen.drawLine(0,0,159,0,8)
        screen.fillRect(0,3,2,17,5)
        escribirCentrado(titulosPractica[paso],3,5)
        // La línea de la lección deja dos píxeles de espacio con la franja amarilla (x 0 a 1): nunca empieza a la
        // izquierda de x 4. Una línea de 26 letras va así de x 4 a x 159; las líneas más cortas siguen centradas.
        let textoLeccion=lineasPractica[paso]
        escribir(textoLeccion,Math.max(4,Math.floor((160-textoLeccion.length*6)/2)),13,1)
        screen.fillRect(0,23,160*(paso+1)/titulosPractica.length,1,10)
        if(paso==0) {
            screen.drawCircle(116,76,6,5);dibujarFlecha(116,64,1,5)
        }
        // Las metas de la práctica siguen visibles para guiar.
        let destino=paso==3?0:paso==4?1:paso==5?2:-1
        if(destino>=0) {dibujarCosa(cosas[destino]);dibujarFlecha(cosas[destino].x,cosas[destino].y+13,3,5)}
        // Pasos 04 a 06: los números del panel (ocultos bajo la banda de práctica) con sus dibujos; en el paso 04 una
        // flecha señala el número de la bolsa y en el paso 05 el del generador.
        if(destino>=0) {
            screen.fillRect(94,25,65,12,15);screen.drawRect(94,25,65,12,10)
            dibujarIconoInstalado(97,27);escribir(instalados+"/5",108,27,9)
            dibujarIconoBolsa(129,27);escribir(llevados+"/3",138,27,5)
            if(paso==3)dibujarFlecha(147,42,3,5)
            if(paso==4)dibujarFlecha(117,42,3,5)
        }
        // Paso 07: Brummi pita y la antena (normalmente en el panel, bajo esta banda) parpadea aquí.
        if(paso==6)dibujarAntena(150,2,destelloPitidoMs>0)
        // Paso 12: la batería de práctica, visible en la oscuridad, con una flecha encima.
        if(paso==11) {
            if(cosas.length>3 && !cosas[3].tomada) {
                dibujarCosa(cosas[3]);dibujarFlecha(cosas[3].x,cosas[3].y-13,1,5)
            }
            // la barra de la lámpara del panel está bajo la banda de práctica: se muestra debajo del cuadro de la regla
            screen.fillRect(4,59,46,9,15);dibujarBarraLampara(6,61)
        }
        if(paso==4) {
            let cosaGenerador=cosas[1]
            let listo=elegido==1
            if(listo)screen.drawRect(cosaGenerador.x-10,cosaGenerador.y-9,20,18,9)
            screen.fillRect(4,75,152,29,15)
            if(colocando) {
                escribirCentrado("COLOCANDO  "+Math.min(3,Math.floor(colocacionMs/1000))+
                    " / 3 S",77,9)
                screen.drawRect(29,87,102,6,10)
                screen.fillRect(30,88,Math.min(100,colocacionMs/30),4,9)
                escribirCentrado("MANTÉN A",96,12)
            } else {
                escribirCentrado(listo?(aBloqueada?"SUELTA Y MANTÉN A":"LISTO: MANTÉN A"):
                    "ACÉRCATE AL GENERADOR",80,listo?9:5)
                escribirCentrado("SUELTA LAS FLECHAS",94,12)
            }
        }
        if(paso==2) {screen.drawRect(29,98,102,4,10);screen.fillRect(30,99,Math.min(100,progreso/20),2,5)}
        if(paso==5 && taquillaEscondida>=0) {
            screen.fillRect(0,89,160,11,15);escribirCentrado("BIEN. A: VUELVE A SALIR.",91,5)
        }
        if(paso>=6 && paso<=11) {
            // Explicar la regla encima de la demostración, sin taparla.
            screen.fillRect(3,27,154,31,15)
            if(paso==6) {
                escribirCentrado("SE LLEVA LO QUE CARGAS",29,5)
                escribirCentrado("Y LO PONE EN SU LUGAR.",39,5)
                escribirCentrado("BIPS: ESTÁ CERCA. A: SIGUE",49,12)
            } else if(paso==7) {
                escribirCentrado("LA LUZ ATRAE A BRUMMI.",29,5)
                escribirCentrado("A OSCURAS VE MENOS.",39,12)
                escribirCentrado("DE CERCA TE DESCUBRE.",49,12)
                // la barra de curiosidad se ve siempre en este paso, justo encima de Brummi
                dibujarBarraCuriosidad(Math.floor(brummi.x)-20,Math.floor(brummi.y)-17)
            } else if(paso==8) {
                escribirCentrado("CORRER ATRAE A BRUMMI.",29,5)
                escribirCentrado("ANDAR HACE MENOS RUIDO.",39,12)
                escribirCentrado("TAMBIÉN OYE EL GENERADOR.",49,12)
                screen.drawRect(29,99,102,4,10)
                screen.fillRect(30,100,Math.min(100,progreso/10),2,5)
            } else if(paso==9) {
                escribirCentrado("SILBA CUANDO ESTÉ CERCA.",29,5)
                escribirCentrado("ASÍ SE PARA UN MOMENTO.",39,12)
                escribirCentrado("ESCUCHA Y BAILA.",49,12)
                dibujarFlecha(109,76,0,5)
                screen.fillRect(4,94,152,15,15)
                escribirCentrado(pausaSilbatoMs>0?
                    "SILBATO LISTO EN "+Math.ceil(pausaSilbatoMs/1000)+" S":
                    "MANTÉN B",97,pausaSilbatoMs>0?10:5)
            } else if(paso==10) {
                escribirCentrado("¡ALÉJATE AHORA!",29,5)
                escribirCentrado("SOLO SE PARA 2,5 S.",39,12)
                escribirCentrado("CORRER: A + DIRECCIÓN",49,12)
                screen.drawCircle(40,76,6,5);dibujarFlecha(52,76,2,5)
            } else {
                escribirCentrado("TU LÁMPARA SE VA GASTANDO.",29,5)
                escribirCentrado("LAS BATERÍAS LA CARGAN.",39,12)
                escribirCentrado("¿VACÍA? FIN DEL TURNO.",49,12)
            }
            if(paso!=8 && paso!=9)escribirCentrado("PRÁCTICA SEGURA",101,10)
        }
        screen.fillRect(0,112,160,8,15);escribirCentrado("BOTÓN MENÚ: SALTAR",112,10)
        if(paso==12) {
            screen.fillRect(2,36,156,61,15);screen.drawRect(2,36,156,61,10)
            escribirCentrado("¡TODO LISTO!",46,5)
            escribirCentrado("5 fusibles. Una salida.",62,12)
            escribirCentrado("A  EMPEZAR TURNO",80,1)
        }
    }
    // Barra de la lámpara: naranja por debajo del 20 %; su marco cambia de color una vez por segundo
    // (sin parpadeo rápido).
    function dibujarBarraLampara(x: number,y: number) {
        let cargaBaja=carga<20
        screen.drawRect(x,y,25,5,cargaBaja?(Math.floor(transcurridoMs/1000)%2==0?4:12):10)
        screen.fillRect(x+1,y+1,Math.max(0,23*carga/100),3,cargaBaja?4:5)
        escribir(""+Math.ceil(carga),x+28,y,12)
    }
    function dibujarPanel() {
        screen.fillRect(0,0,160,11,15)
        screen.drawLine(0,10,159,10,8)
        dibujarBarraLampara(3,3)
        dibujarIconoInstalado(53,3);escribir(instalados+"/5",64,3,9)
        dibujarIconoBolsa(91,3);escribir(llevados+"/3",100,3,5)
        if(distanciaPitido<=12)dibujarAntena(150,1,destelloPitidoMs>0)
        if(llevados>0 && brummi.vistoMs>0 && brummi.comportamiento!=Comportamiento.Seguir)dibujarBarraCuriosidad(60,13)
        if(bMantenidaMs>0) {
            screen.drawRect(Math.floor(personajeX)-7,Math.floor(personajeY)+8,14,3,10)
            screen.fillRect(Math.floor(personajeX)-6,Math.floor(personajeY)+9,12*Math.min(1,bMantenidaMs/350),1,5)
        }
        if(pausaSilbatoMs>0) {dibujarIconoSilbato(137,13);escribir(""+Math.ceil(pausaSilbatoMs/1000),147,13,10)}
        screen.fillRect(0,112,160,8,15)
        if(colocando) {
            escribir("COLOCAR",4,112,5);screen.drawRect(65,114,89,4,10)
            screen.fillRect(66,115,87*colocacionMs/3000,2,9)
        } else if(tiempoMensajeMs>0) {
            // Brummi ha devuelto un fusible: dibujo de fusible y nombre de la sala donde vuelve a estar.
            if(iconoMensaje) {
                let x=Math.floor((160-textoMensaje.length*6-10)/2)
                dibujarIconoFusible(x,112)
                escribir(textoMensaje,x+10,112,5)
            }
            else escribirCentrado(textoMensaje,112,5)
        }
        else if(elegido>=0) {
            let cosa=cosas[elegido],rotulo=cosa.tipo==TipoCosa.Fusible?"A: FUSIBLE":
                cosa.tipo==TipoCosa.Bateria?
                    "A: BATERÍA +"+Math.min(GANANCIA_BATERIA,Math.floor(100-carga)):
                cosa.tipo==TipoCosa.Taquilla?(taquillaEscondida>=0?"A: SALIR DE LA TAQUILLA":"A: ESCONDERSE"):
                cosa.tipo==TipoCosa.Generador?"MANTÉN A: COLOCAR":"ASCENSOR / SIN CORRIENTE"
            escribirCentrado(rotulo,112,12)
        } else {escribirCentrado(edadMs%6000<4000?salas[sala].nombreSala:"BOTÓN MENÚ: PAUSA",112,10)}
        if(transicionMs>0) {screen.fillRect(3,49,154,13,15);escribirCentrado(salas[sala].nombreSala,53,5)}
    }
    function dibujarMundo() {
        if(fondoSala!=sala || fondoNumeroMina!=numeroMina) {
            dibujarDecoradoSala()
            fondoSala=sala
            fondoNumeroMina=numeroMina
        }
        screen.drawImage(fondo,0,0)
        for(let i=0;i<cosas.length;i++)if(cosas[i].sala==sala && !cosas[i].tomada)dibujarCosa(cosas[i])
        if(!reducido && lampara)for(let i=0;i<7;i++) {
            let x=(i*37+Math.floor(transcurridoMs/160))%144+8
            let y=(i*23+Math.floor(transcurridoMs/240))%92+16
            if(esVisible(x,y))screen.setPixel(x,y,i%3==0?12:10)
        }
        dibujarPersonaje();dibujarOscuridad();dibujarBrummiEnMundo();dibujarSenales()
        // Silbato: dos anillos de sonido alrededor del personaje, de radio 6 a 17 en 300 ms (solo dibujo: la
        // luz no cambia).
        if(efectoSilbatoMs>0) {
            let anillo=6+Math.floor((300-efectoSilbatoMs)/25),
                centroX=Math.floor(personajeX),centroY=Math.floor(personajeY)
            screen.drawCircle(centroX,centroY,anillo,9)
            if(anillo>10)screen.drawCircle(centroX,centroY,anillo-5,9)
        }
        dibujarPanel()
        if(estado==Estado.Practica)dibujarBandaPractica()
    }
    function dibujarPausa() {
        screen.fill(15)
        escribirCentrado("TURNO EN PAUSA",18,5)
        screen.drawLine(15,29,145,29,10)
        for(let i=0;i<4;i++) {
            let rotulo=i==0?"CONTINUAR":
                i==1?(estadoAnterior==Estado.Practica?"SALTAR PRÁCTICA":
                    (reducido?"EFECTOS: REDUCIDOS":"EFECTOS: CINE")):
                i==2?(mudo?"SONIDO: NO":"SONIDO: SÍ"):
                "PANTALLA INICIAL"
            escribir(rotulo,23,38+i*13,menu==i?1:10)
            if(menu==i)escribir(">",13,38+i*13,5)
        }
        escribirCentrado("DIRECCIÓN: ELEGIR  A: OK",112,10)
    }
    // Tarjetas de resultado. Aquí nadie pierde nada: la lámpara está vacía y la noche ha terminado.
    function dibujarResultado() {
        screen.fill(15)
        let faseSaludo=Math.floor(edadMs/500)%2
        let segundos=Math.floor(tiempoMs/1000),y=75
        if(ganado) {
            for(let i=0;i<6;i++)screen.drawLine(35+i*18,15,35+i*18,45,8)
            screen.fillRect(32,35,98,4,5)
            // Brummi saluda junto al ascensor
            dibujarRobot(142,38,Comportamiento.Ronda,0,5,faseSaludo?2:0)
            escribirCentrado("ARRIBA. POR FIN.",51,1)
            escribirCentrado(vecesDescubierto==0?"SIN RUIDO, COMO UN RATÓN":
                fusiblesRetirados==0?"¡NADA PERDIDO!":"¡TURNO SUPERADO!",66,5)
        } else {
            // Brummi, con su luz, acompaña al personaje hasta el ascensor (imagen de y 8 a 35). La reja está abierta:
            // sus barras plegadas están empujadas a los dos lados y la cabina está iluminada.
            screen.fillRect(52,8,56,27,14);screen.drawRect(52,8,56,27,10);screen.fillRect(60,10,40,23,11)
            for(let x=54;x<59;x+=2) {screen.drawLine(x,10,x,32,8);screen.drawLine(x+47,10,x+47,32,8)}
            screen.drawLine(40,35,120,35,13)
            screen.fillCircle(66,25,10,8)
            dibujarRobot(66,29,Comportamiento.Ronda,faseSaludo,5,faseSaludo?2:0)
            dibujarPersonajeEn(88,28,-1,0,false,faseSaludo)
            escribirCentrado("FIN DEL TURNO POR HOY.",38,1)
            escribirCentrado(motivoFin,47,5)
            escribirCentrado("BRUMMI TE ACOMPAÑA FUERA.",56,12)
            // hasta dónde llegó la noche (fusibles en el generador, de 5) y un consejo
            dibujarIconoInstalado(65,66);escribir(instalados+"/5",77,66,9)
            escribirCentrado("CONSEJO: TOMA BATERÍAS.",75,5)
            y=85
        }
        let espacioLineas=ganado?10:9
        escribirCentrado("TIEMPO "+Math.floor(segundos/60)+":"+(segundos%60<10?"0":"")+segundos%60,y,12)
        escribirCentrado("VISITAS DE BRUMMI: "+contactos,y+espacioLineas,10)
        escribirCentrado("SILBIDOS "+silbidos+"  MINA "+numeroMina,y+2*espacioLineas,10)
        escribirCentrado("A: REPETIR  B: OTRA MINA",ganado?109:112,5)
    }
    export function dibujar() {
        // La paleta que se quiere para este cuadro: la del estudio solo en la sala de control y en
        // la tarjeta (Cine.esMomentoEstudio).
        Cine.elegirPaleta(estado==Estado.Intro && Cine.esMomentoEstudio(tiempoPeliculaIntroMs(edadMs)))
        if(estado==Estado.Intro)dibujarIntro()
        else if(estado==Estado.Titulo)dibujarTitulo()
        else if(estado==Estado.OfertaPractica)dibujarOfertaPractica()
        else if(estado==Estado.Partida || estado==Estado.Practica)dibujarMundo()
        else if(estado==Estado.Pausa)dibujarPausa()
        else dibujarResultado()
    }
    export function olvidarImagenes() {fondoSala=-1;mascaraSala=-1}
}
