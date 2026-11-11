// Las reglas de la noche de trabajo: salas, personaje, Brummi, lámpara, silbato, menús y práctica. Aquí no se dibuja
// nada ni suena nada. El tiempo llega de fuera como un valor dt, así el juego se desarrolla siempre igual. pedirSonido
// solo apunta un encargo para el archivo sonido.ts. El dibujo solo interviene para olvidar sus
// imágenes guardadas (olvidarImagenes).
namespace Noche {
    export enum Estado { Intro, Titulo, OfertaPractica, Practica, Partida, Pausa, Resultado }
    export enum Comportamiento { EstacionCarga, Ronda, Curioso, Seguir, Mirar, Escuchar, Devolver }
    // TipoSala dice qué es una sala (TipoSala.Generador: la sala del generador); TipoCosa dice qué hay en una sala
    // (TipoCosa.Generador: el generador mismo, donde se meten los fusibles).
    export enum TipoSala { Ascensor, Pasillo, Taller, Nave, Generador, Almacen, EstacionCarga }
    export enum TipoCosa { Fusible, Bateria, Taquilla, Generador, Salida }
    export class DatosSala {
        x: number; y: number; tipo: TipoSala; nombreSala: string
        puertas: number[]; baldosas: Buffer; visitada: boolean
        constructor(x: number, y: number, tipo: TipoSala, nombreSala: string) {
            this.x = x; this.y = y; this.tipo = tipo; this.nombreSala = nombreSala
            this.puertas = [-1, -1, -1, -1]; this.baldosas = control.createBuffer(300); this.visitada = false
        }
    }
    export class Cosa {
        sala: number; x: number; y: number; tipo: TipoCosa; tomada: boolean
        constructor(sala: number, x: number, y: number, tipo: TipoCosa) {
            this.sala = sala; this.x = x; this.y = y; this.tipo = tipo; this.tomada = false
        }
    }
    export class Robot {
        constructor() {}
        sala = 11; x = 116; y = 60; dx = -1; dy = 0
        comportamiento: Comportamiento = Comportamiento.EstacionCarga; salaDestino = 11; destinoX = 116; destinoY = 60
        temporizadorMs = 0; sinVerMs = 0; vistoMs = 0; despertarRestanteMs = 0; taquillaObservada = -1
        rutaX = 0; rutaY = 0; edadRutaMs = 1000; numeroCasillaDestino = -1; esperaMs = 0
        numeroFusible = -1 // número del fusible que Brummi devuelve, -1 = ninguno
    }
    // Una sola línea de tiempo para la imagen y el sonido de la intro. Las partes para leer reciben más tiempo que las
    // partes de acción: marcasPeliculaMs da instantes de la película y marcasRealesMs los mismos puntos en tiempo real.
    // Entre dos marcas el tiempo se estira o se comprime. Los sonidos conservan su velocidad y su tono.
    export const duracionIntroMs = 64000
    const marcasPeliculaMs = [0,4200,5500,7000,9600,12700,14500,16200,18500,23000,23900,25500,34500,38000]
    const marcasRealesMs = [0,6000,7800,12000,17000,20000,25000,27500,32000,37000,38500,43500,57000,64000]
    export function tiempoPeliculaIntroMs(realMs: number): number {
        for(let i=1;i<marcasRealesMs.length;i++)if(realMs<marcasRealesMs[i])
            return marcasPeliculaMs[i-1]+(realMs-marcasRealesMs[i-1])*
                (marcasPeliculaMs[i]-marcasPeliculaMs[i-1])/(marcasRealesMs[i]-marcasRealesMs[i-1])
        return marcasPeliculaMs[marcasPeliculaMs.length-1]
    }
    export function tiempoRealIntroMs(peliculaMs: number): number {
        for(let i=1;i<marcasPeliculaMs.length;i++)if(peliculaMs<marcasPeliculaMs[i])
            return marcasRealesMs[i-1]+(peliculaMs-marcasPeliculaMs[i-1])*
                (marcasRealesMs[i]-marcasRealesMs[i-1])/(marcasPeliculaMs[i]-marcasPeliculaMs[i-1])
        return duracionIntroMs
    }
    export let estado = Estado.Intro
    export let estadoAnterior = Estado.Partida
    export let edadMs = 0
    export let tiempoMs = 0
    export let numeroMina = 9137
    let valorAzar = 9137
    export let salas: DatosSala[] = []
    export let cosas: Cosa[] = []
    export let brummi = new Robot()
    export let sala = 0
    export let personajeX = 76
    export let personajeY = 60
    export let orientacionX = 1
    export let orientacionY = 0
    export let carga = 100
    export let lampara = false
    export let llevados = 0
    export let instalados = 0
    export let taquillaEscondida = -1
    export let colocacionMs = 0
    export let colocando = false
    export let vecesDescubierto = 0
    export let silbidos = 0
    export let efectoSilbatoMs = 0
    export let pausaSilbatoMs = 0
    export let bMantenidaMs = 0
    export let bActivada = false
    export let aBloqueada = false
    export let elegido = -1
    export let paso = 0
    export let edadPasoMs = 0
    export let progreso = 0
    export let textoMensaje = ""
    export let tiempoMensajeMs = 0
    // un dibujito de fusible antes del mensaje: Brummi ha devuelto un fusible a esta sala
    export let iconoMensaje = false
    // los avisos de la lámpara esperan mientras se coloca un fusible; los demás mensajes desaparecen cuando
    // empieza la colocación
    export let mensajeEspera = false
    export let reducido = false
    export let mudo = false
    export let ganado = false
    export let motivoFin = ""
    export let menu = 0
    export let pitidoRestanteMs = 0
    export let distanciaPitido = 999
    export let numeroEfecto = 0
    export let prioridadEfecto = 0
    export let efectoRestanteMs = 0
    export let ultimoRuidoMs = 0
    export let salaUltimoRuido = -1
    export let ultimoRuidoX = 0
    export let ultimoRuidoY = 0
    export let transicionMs = 0
    export let destelloPitidoMs = 0
    export let transcurridoMs = 0
    export let contactos = 0     // cuántas veces Brummi ha alcanzado al personaje en esta noche (con fusible o sin él)
    // fusibles que Brummi le ha quitado al personaje para devolverlos a su sitio (de aquí depende «¡NADA PERDIDO!»)
    export let fusiblesRetirados = 0
    export let respiroMs = 0     // milisegundos que quedan en los que un segundo contacto no cuenta
    export let contentoMs = 0    // milisegundos que quedan en los que Brummi está contento y no se fija en nada
    export let bolsa: number[] = [] // números de los fusibles que lleva el personaje, el más antiguo primero
    export let avisosDados = 0   // avisos de la lámpara ya dados (0, 1 o 2)
    // Valores para probar: para hacer el juego más fácil o más difícil, cambia estos números y mira qué pasa.
    export const CONSUMO_REPOSO = 0.08   // % por segundo: la lámpara del casco siempre brilla un poco
    export const CONSUMO_HAZ = 0.30      // % por segundo con el haz encendido (en vez de CONSUMO_REPOSO)
    export const GANANCIA_BATERIA = 35   // % que da cada batería
    export const AVISO_LAMPARA_1 = 30    // primer aviso de la lámpara, en %
    export const AVISO_LAMPARA_2 = 15    // segundo aviso de la lámpara, en %
    // píxeles por segundo cuando Brummi sigue al personaje (andando 45, corriendo 92)
    export const VELOCIDAD_SEGUIR = 64
    export const PLUS_SEGUIR = 2         // píxeles por segundo de más por cada fusible instalado
    export const SEGUIR_VACIO = 0        // 1 = Brummi sigue también a un personaje sin fusible (en el juego vale 0)
    export const VELOCIDAD_LLEVAR = 60   // píxeles por segundo cuando Brummi devuelve un fusible
    export const RESPIRO_MS = 4000       // tiempo sin nuevo contacto (nunca menos de 3000)
    export const CONTENTO_MS = 10000     // Brummi está contento después de devolver un fusible y no se fija en nada
    // ... y 5 s más por cada fusible que ya ha devuelto en esta noche
    export const CONTENTO_PLUS_MS = 5000
    export const CONTENTO_MAX_MS = 30000 // ... pero nunca más de 30 s
    export const MIRAR_MS = 5000         // Brummi mira a su alrededor después de perder de vista al personaje
    export const PARAR_SILBATO_MS = 2500 // Brummi se para y escucha después de un silbido
    export const PAUSA_SILBATO_MS = 6000
    // en píxeles, en la misma sala y en cualquier dirección, sin necesidad de ver al personaje
    export const ALCANCE_SILBATO = 72
    export const PITIDO_CERCA_MS = 500   // pausa entre dos pitidos cuando Brummi está muy cerca
    export const PITIDO_POR_BALDOSA_MS = 150 // milisegundos de más por cada baldosa de distancia
    export const DESPERTAR_MS = 4000     // desde el primer fusible hasta que Brummi sale de su estación de carga
    // Reglas fijas, no valores de equilibrio.
    // A y B cuentan como combinación de pausa solo si se pulsan con menos de 150 ms de diferencia.
    export const COMBO_PAUSA_MS = 150
    // la tarjeta «Calliope Hacker presenta» empieza aquí (tiempo real de la intro)
    export const INICIO_TARJETA_MS = 43500
    export const BLOQUEO_TARJETA_MS = 1500 // en la tarjeta, A o B abre el menú del título pasado este tiempo
    // carga de la lámpara en el paso 12 de la práctica, hasta que se toma la batería
    export const BATERIA_PRACTICA = 40
    let ultimasTeclas = 0
    let comboMs = 0
    let relojRuidoMs = 0
    let relojRuidoColocacionMs = 0
    let relojRadarMs = 0
    let sonidoAmbienteMs = 0
    let aPulsadaMs = 0
    let bPulsadaMs = 0
    // 12 salas de 300 baldosas; los búferes compartidos de 16 bits evitan miles de números sueltos.
    // Un número de casilla cuenta las baldosas de toda la mina: sala × 300 + fila × 20 + columna. La baldosa, en
    // cambio, se numera solo dentro de su sala.
    let colaCasillas = control.createBuffer(7200)
    let tablaDistancias = control.createBuffer(7200)
    let distanciasCamino = control.createBuffer(600)
    let colaCamino = control.createBuffer(600)
    let numeroCasillaCamino = -1
    export let calculosCamino = 0
    let salasRuta: number[] = []
    let tablaRutas = control.createBuffer(144)
    let tablaRutasValida = false
    const SALA_X = [0,1,1,2,2,2,1,3,3,3,4,4]
    const SALA_Y = [2,2,1,1,2,3,3,1,2,3,2,3]
    const TIPOS_SALA = [TipoSala.Ascensor,TipoSala.Pasillo,
        TipoSala.Taller,TipoSala.Nave,TipoSala.Generador,TipoSala.Taller,
        TipoSala.Nave,TipoSala.Almacen,TipoSala.Pasillo,TipoSala.Almacen,TipoSala.Pasillo,TipoSala.EstacionCarga]
    const NOMBRES_SALA = ["ASCENSOR", "DISTRIBUIDOR", "TALLER", "NAVE DE GRÚAS", "GENERADOR", "SALA DE BOMBAS",
        "ESTANQUE", "ALMACÉN NORTE", "POZO", "ALMACÉN SUR", "CINTA TRANSPORTADORA", "ESTACIÓN DE CARGA"]
    export const titulosPractica = [
        "01 / LLEGADA", "02 / LUZ", "03 / MOVIMIENTO", "04 / RECOGER", "05 / CORRIENTE",
        "06 / ESCONDERSE", "07 / BRUMMI", "08 / VISTA", "09 / OÍDO",
        "10 / SILBATO", "11 / DISTANCIA", "12 / LÁMPARA", "13 / LISTO"
    ]
    export const lineasPractica = [
        "Ve a la meta amarilla.",
        "Pulsa B: enciende la luz.",
        "A + dirección: corre 2 s.",
        "Ve al fusible. Para y A.",
        "Para, mantén A.",
        "Taquilla: A, luego otra A.",
        "Conoce a Brummi.",
        "Pulsa B: apaga la luz.",
        "A + dirección: corre 1 s.",
        "Mantén B: silba.",
        "Corre a la meta izquierda.",
        "Toma la batería: A.",
        "Práctica lista. A: jugar"
    ]
    export function pedirSonido(numero: number, prioridad: number) {
        if (prioridad >= prioridadEfecto || efectoRestanteMs <= 0) {
            numeroEfecto = numero; prioridadEfecto = prioridad; efectoRestanteMs = prioridad >= 3 ? 350 : 100
        }
    }
    export function mostrarMensaje(texto: string) {
        textoMensaje = texto; tiempoMensajeMs = 2200; iconoMensaje = false; mensajeEspera = false
    }
    export function azar(limite: number): number {
        valorAzar = (valorAzar * 1664525 + 1013904223) | 0
        return (valorAzar & 0x7fffffff) % limite
    }
    export function entrarEstado(nuevo: Estado) {
        estado = nuevo; edadMs = 0; bMantenidaMs = 0; bActivada = false; colocacionMs = 0; colocando = false
        aBloqueada = true; comboMs = 0; menu = 0
        // Una tecla que aún está pulsada antes del cambio de estado solo cuenta cuando se suelta: B no hace nada hasta
        // soltarla, y A + B mantenidas durante el cambio no forman la combinación de pausa.
        bActivada = true; aPulsadaMs = -1000000; bPulsadaMs = 1000000
    }
    function unir(unaSala: number, otraSala: number) {
        let direccion = SALA_X[otraSala] > SALA_X[unaSala] ? 0
            : SALA_Y[otraSala] > SALA_Y[unaSala] ? 1 : SALA_X[otraSala] < SALA_X[unaSala] ? 2 : 3
        salas[unaSala].puertas[direccion] = otraSala; salas[otraSala].puertas[(direccion + 2) % 4] = unaSala
    }
    export function esMuro(numeroSala: number, x: number, y: number): boolean {
        if (numeroSala < 0 || numeroSala >= salas.length || x < 0 || y < 0 || x >= 20 || y >= 15) return true
        return salas[numeroSala].baldosas.getUint8(y * 20 + x) == 1
    }
    export function baldosa(numeroSala: number, x: number, y: number): number {
        if (x < 0 || y < 0 || x >= 20 || y >= 15) return 1
        return salas[numeroSala].baldosas.getUint8(y * 20 + x)
    }
    function ponerBaldosa(numeroSala: number, x: number, y: number, valor: number) {
        salas[numeroSala].baldosas.setUint8(y * 20 + x, valor)
    }
    function ponerObstaculo(numeroSala: number, x: number, y: number, ancho: number, alto: number) {
        for (let j = y; j < y + alto; j++) for (let i = x; i < x + ancho; i++) ponerBaldosa(numeroSala, i, j, 1)
    }
    export function crearMundo(semilla: number) {
        numeroMina = Math.max(1, semilla & 0x7fffffff); valorAzar = numeroMina
        salas = []; cosas = []; tablaRutasValida = false; numeroCasillaCamino = -1; calculosCamino = 0
        for (let i = 0; i < 12; i++) salas.push(new DatosSala(SALA_X[i],
            SALA_Y[i], TIPOS_SALA[i], NOMBRES_SALA[i]))
        unir(0,1); unir(1,2); unir(1,6); unir(2,3); unir(3,4); unir(4,5); unir(5,6)
        unir(3,7); unir(7,8); unir(8,9); unir(9,5); unir(8,10); unir(10,11); unir(11,9)
        if (azar(2)) unir(4,8)
        for (let numeroSala = 0; numeroSala < 12; numeroSala++) {
            for (let y = 0; y < 15; y++) for (let x = 0; x < 20; x++)
                ponerBaldosa(numeroSala,x,y,x == 0 || y == 0 || x == 19 || y == 14 ? 1 : 0)
            if (salas[numeroSala].puertas[0] >= 0) {
                ponerBaldosa(numeroSala,19,7,0)
                ponerBaldosa(numeroSala,19,8,0)
            }
            if (salas[numeroSala].puertas[2] >= 0) { ponerBaldosa(numeroSala,0,7,0); ponerBaldosa(numeroSala,0,8,0) }
            if (salas[numeroSala].puertas[1] >= 0) {
                ponerBaldosa(numeroSala,9,14,0)
                ponerBaldosa(numeroSala,10,14,0)
            }
            if (salas[numeroSala].puertas[3] >= 0) {
                ponerBaldosa(numeroSala,9,0,0)
                ponerBaldosa(numeroSala,10,0,0)
            }
            if (numeroSala != 0 && numeroSala != 1) {
                // Un obstáculo cambia de altura según la variante; la cruz del centro y las líneas de las cosas
                // siempre quedan libres.
                let variante = azar(2)
                ponerObstaculo(numeroSala,5,4,2,variante ? 3 : 2)
                ponerObstaculo(numeroSala,13,9,2,2)
                if (TIPOS_SALA[numeroSala] == TipoSala.Almacen) {
                    ponerObstaculo(numeroSala,13,3,2,3)
                    ponerObstaculo(numeroSala,5,10,2,2)
                }
                if (TIPOS_SALA[numeroSala] == TipoSala.Taller)
                    for (let x = 11; x < 14; x++) ponerBaldosa(numeroSala,x,5,2)
            }
            if (numeroSala == 5 || numeroSala == 6) for (let x = 3; x < 6; x++) for (let y = 8; y < 11; y++)
                if (!esMuro(numeroSala,x,y)) ponerBaldosa(numeroSala,x,y,3)
        }
        cosas.push(new Cosa(0,76,52,TipoCosa.Salida))
        cosas.push(new Cosa(4,76,52,TipoCosa.Generador))
        cosas.push(new Cosa(1,76,60,TipoCosa.Fusible))
        let candidatos = [2,3,5,6,7,8,9,10]
        for (let i = candidatos.length - 1; i > 0; i--) {
            let j = azar(i+1); let temporal=candidatos[i]; candidatos[i]=candidatos[j]; candidatos[j]=temporal
        }
        for (let i = 0; i < 4; i++) cosas.push(new Cosa(candidatos[i], i % 2 ? 124 : 28, 92, TipoCosa.Fusible))
        for (let i = 0; i < 4; i++) cosas.push(new Cosa([7,9,2,5][i],124,28,TipoCosa.Bateria))
        for (let i = 0; i < 4; i++) cosas.push(new Cosa([2,5,7,9][i],28,28,TipoCosa.Taquilla))
        for(let salaDesde=0;salaDesde<12;salaDesde++)for(let salaHasta=0;salaHasta<12;salaHasta++)tablaRutas.setUint8(
            salaDesde*12+salaHasta,proximaSala(salaDesde,salaHasta,true))
        tablaRutasValida = true
    }
    export function esMundoValido(): boolean {
        if(salas.length!=12)return false
        tablaDistancias.fill(0)
        let casillaInicial=9+7*20,posicionLectura=0,posicionEscritura=1
        colaCasillas.setNumber(NumberFormat.UInt16LE,0,casillaInicial)
        tablaDistancias.setNumber(NumberFormat.UInt16LE,casillaInicial*2,1)
        while(posicionLectura<posicionEscritura) {
            let numeroCasilla=colaCasillas.getNumber(NumberFormat.UInt16LE,posicionLectura++*2)
            for(let direccion=0;direccion<4;direccion++) {
                let casillaVecina=vecino(numeroCasilla,direccion)
                if(casillaVecina>=0 && tablaDistancias.getNumber(NumberFormat.UInt16LE,casillaVecina*2)==0) {
                    tablaDistancias.setNumber(NumberFormat.UInt16LE,casillaVecina*2,1)
                    colaCasillas.setNumber(NumberFormat.UInt16LE,posicionEscritura++*2,casillaVecina)
                }
            }
        }
        for(let numeroSala=0;numeroSala<12;numeroSala++)for(let numeroBaldosa=0;numeroBaldosa<300;numeroBaldosa++) {
            if(salas[numeroSala].baldosas.getUint8(numeroBaldosa)!=1
                && tablaDistancias.getNumber(NumberFormat.UInt16LE,(numeroSala*300+numeroBaldosa)*2)==0)
                return false
        }
        let salasFusibles=control.createBuffer(12),fusiblesColocados=0,bateriasColocadas=0
        for(let i=0;i<cosas.length;i++) {
            let cosa=cosas[i]
            if(!puedePisar(cosa.sala,cosa.x,cosa.y))return false
            if(cosa.tipo==TipoCosa.Fusible) {
                if(salasFusibles.getUint8(cosa.sala))return false
                salasFusibles.setUint8(cosa.sala,1)
                fusiblesColocados++
            }
            if(cosa.tipo==TipoCosa.Bateria)bateriasColocadas++
        }
        return fusiblesColocados==5 && bateriasColocadas==4 && puedePisar(11,116,60)
    }
    export function empezar(semilla: number, practica: boolean) {
        crearMundo(semilla)
        // Cada mundo creado se comprueba. Si no es válido, se crea otro con otra semilla (49 intentos como máximo) y,
        // como último recurso, con 9137.
        let intentos = 0
        while (!esMundoValido() && intentos < 49) { intentos++; crearMundo(semilla + intentos) }
        if (!esMundoValido()) crearMundo(9137)
        Noche.olvidarImagenes()
        sala = 0; personajeX = 76; personajeY = 76; orientacionX = 1; orientacionY = 0
        carga = 100; lampara = false; llevados = 0; instalados = 0; taquillaEscondida = -1
        pausaSilbatoMs = 0; efectoSilbatoMs = 0; vecesDescubierto = 0
        silbidos = 0; tiempoMs = 0; iconoMensaje = false; mensajeEspera = false
        contactos = 0; fusiblesRetirados = 0; respiroMs = 0; contentoMs = 0; bolsa = []; avisosDados = 0
        brummi = new Robot(); textoMensaje = ""; tiempoMensajeMs = 0; distanciaPitido = 999
        relojRadarMs = 0; relojRuidoMs = 0; relojRuidoColocacionMs = 0; pitidoRestanteMs = 0; destelloPitidoMs = 0
        paso = 0; progreso = 0; edadPasoMs = 0; ganado = false; motivoFin = ""
        ultimoRuidoMs = 0; salaUltimoRuido = -1; transicionMs = 0; ultimasTeclas = 0
        numeroEfecto = 0; prioridadEfecto = 0; efectoRestanteMs = 0; elegido = -1; sonidoAmbienteMs = 0
        if (practica) {
            // La práctica está separada del juego: su inventario, su batería y el comportamiento de Brummi nunca pasan
            // a una noche de verdad. El generador y la taquilla están en y = 32, debajo de la línea de la lección de la
            // banda de práctica (que termina en y = 23).
            cosas = [new Cosa(0,116,44,TipoCosa.Fusible),new Cosa(0,76,32,TipoCosa.Generador),
                new Cosa(0,28,32,TipoCosa.Taquilla)]
            salas[0].puertas[0] = -1; ponerBaldosa(0,19,7,1); ponerBaldosa(0,19,8,1)
        }
        salas[0].visitada = true
        entrarEstado(practica ? Estado.Practica : Estado.Partida)
        if(practica)pedirSonido(21,2)
    }
    export function tieneVista(numeroSala: number, desdeX: number,
        desdeY: number, hastaX: number, hastaY: number): boolean {
        let x = Math.floor(desdeX/8), y = Math.floor(desdeY/8),
            columnaDestino = Math.floor(hastaX/8), filaDestino = Math.floor(hastaY/8)
        let dx = Math.abs(columnaDestino-x), dy = -Math.abs(filaDestino-y),
            sentidoX = x<columnaDestino ? 1 : -1, sentidoY = y<filaDestino ? 1 : -1
        let error = dx + dy
        for (let pasada = 0; pasada < 40; pasada++) {
            if (x == columnaDestino && y == filaDestino) return true
            if (esMuro(numeroSala,x,y)) return false
            let errorDoble = 2*error
            if (errorDoble >= dy) { error += dy; x += sentidoX }
            if (errorDoble <= dx) { error += dx; y += sentidoY }
        }
        return false
    }
    export function enHaz(verticeX: number, verticeY: number, dx: number, dy: number,
        puntoX: number, puntoY: number, alcance: number, coseno: number): boolean {
        let distanciaX = puntoX-verticeX, distanciaY=puntoY-verticeY,
            distancia = Math.sqrt(distanciaX*distanciaX+distanciaY*distanciaY)
        return distancia <= alcance && (distancia < 1 || (distanciaX*dx+distanciaY*dy) / distancia >= coseno)
    }
    export function esVisible(x: number, y: number): boolean {
        let cerca = (x-personajeX)*(x-personajeX)+(y-personajeY)*(y-personajeY) <= 144
        if (taquillaEscondida >= 0)
            return Math.abs(y-personajeY) < 8 && Math.abs(x-personajeX)<64 && tieneVista(sala,personajeX,personajeY,x,y)
        return (cerca || lampara && enHaz(personajeX,personajeY,orientacionX,orientacionY,x,y,64,0.866))
            && tieneVista(sala,personajeX,personajeY,x,y)
    }
    export function veAlPersonaje(): boolean {
        if (brummi.comportamiento == Comportamiento.EstacionCarga
            || brummi.comportamiento == Comportamiento.Escuchar || brummi.comportamiento == Comportamiento.Devolver
            || respiroMs > 0 || contentoMs > 0 || taquillaEscondida >= 0
            || sala == 0 && estado != Estado.Practica || brummi.sala != sala) return false
        if (!tieneVista(sala,brummi.x,brummi.y,personajeX,personajeY)) return false
        let dx = personajeX-brummi.x, dy = personajeY-brummi.y
        if (dx*dx+dy*dy <= 144) return true
        return enHaz(brummi.x,brummi.y,brummi.dx,brummi.dy,personajeX,personajeY,lampara ? 72 : 24,0.819)
    }
    function vecino(numeroCasilla: number, direccion: number): number {
        let numeroSala = Math.floor(numeroCasilla/300), numeroBaldosa = numeroCasilla%300,
            x=numeroBaldosa%20, y=Math.floor(numeroBaldosa/20)
        let columnaVecina=x+(direccion==0 ? 1 : direccion==2 ? -1 : 0),
            filaVecina=y+(direccion==1 ? 1 : direccion==3 ? -1 : 0)
        if (columnaVecina<0 || columnaVecina>=20 || filaVecina<0 || filaVecina>=15) {
            numeroSala = salas[numeroSala].puertas[direccion]
            if (numeroSala<0) return -1
            columnaVecina = columnaVecina<0 ? 19 : columnaVecina>=20 ? 0 : columnaVecina
            filaVecina=filaVecina<0 ? 14 : filaVecina>=15 ? 0 : filaVecina
        }
        if (esMuro(numeroSala,columnaVecina,filaVecina)) return -1
        return numeroSala*300+filaVecina*20+columnaVecina
    }
    // Cálculo exacto de la distancia andando, limitado al alcance del ruido (como mucho 12 baldosas).
    export function caminoSonoro(numeroSala: number, x: number, y: number,
        otraSala: number, otraX: number, otraY: number, limite: number): number {
        let casillaInicial = numeroSala*300+Math.floor(y/8)*20+Math.floor(x/8)
        let casillaFinal = otraSala*300+Math.floor(otraY/8)*20+Math.floor(otraX/8)
        tablaDistancias.fill(0)
        let posicionLectura=0,posicionEscritura=1; colaCasillas.setNumber(NumberFormat.UInt16LE,0,casillaInicial)
        tablaDistancias.setNumber(NumberFormat.UInt16LE,casillaInicial*2,1)
        while (posicionLectura<posicionEscritura) {
            let numeroCasilla=colaCasillas.getNumber(NumberFormat.UInt16LE,posicionLectura++*2),
                valor=tablaDistancias.getNumber(NumberFormat.UInt16LE,numeroCasilla*2)
            if (numeroCasilla==casillaFinal) return valor-1
            if (valor>limite) continue
            for (let direccion=0;direccion<4;direccion++) {
                let siguiente=vecino(numeroCasilla,direccion)
                if (siguiente>=0 && tablaDistancias.getNumber(NumberFormat.UInt16LE,siguiente*2)==0) {
                    tablaDistancias.setNumber(NumberFormat.UInt16LE,siguiente*2,valor+1)
                    colaCasillas.setNumber(NumberFormat.UInt16LE,posicionEscritura++*2,siguiente)
                }
            }
        }
        return 999
    }
    export function hacerRuido(radio: number, x: number, y: number, salaOrigen: number) {
        if (baldosa(salaOrigen,Math.floor(x/8),Math.floor(y/8)) == 3) radio /= 2
        ultimoRuidoMs=450; ultimoRuidoX=x; ultimoRuidoY=y; salaUltimoRuido=salaOrigen
        if (brummi.comportamiento == Comportamiento.EstacionCarga
            || brummi.comportamiento == Comportamiento.Escuchar || brummi.comportamiento == Comportamiento.Devolver
            || contentoMs > 0 || estado == Estado.Practica) return
        if (caminoSonoro(salaOrigen,x,y,brummi.sala,brummi.x,brummi.y,radio) <= radio) {
            brummi.esperaMs=0;brummi.salaDestino=salaOrigen
            brummi.destinoX=x; brummi.destinoY=y; brummi.edadRutaMs=1000
            if (brummi.comportamiento != Comportamiento.Seguir) {
                brummi.comportamiento=Comportamiento.Curioso
                brummi.temporizadorMs=0
            }
        }
    }
    export function proximaSala(desde: number, hasta: number, ascensorPermitido: boolean): number {
        if (desde == hasta || !ascensorPermitido && hasta == 0) return desde
        if (tablaRutasValida) return tablaRutas.getUint8(desde*12+hasta)
        let salasPrevias: number[] = []; salasRuta = []
        for(let i=0;i<salas.length;i++) salasPrevias.push(-2)
        salasPrevias[desde]=-1; salasRuta.push(desde)
        for (let posicionLectura=0;posicionLectura<salasRuta.length;posicionLectura++) {
            let numeroSala=salasRuta[posicionLectura]
            for(let direccion=0;direccion<4;direccion++) {
                let salaVecina=salas[numeroSala].puertas[direccion]
                if(salaVecina<0 || !ascensorPermitido && salaVecina==0 || salasPrevias[salaVecina]!=-2) continue
                salasPrevias[salaVecina]=numeroSala; salasRuta.push(salaVecina)
            }
        }
        if(salasPrevias[hasta]==-2) return desde
        let siguiente=hasta
        while(salasPrevias[siguiente]>=0 && salasPrevias[siguiente]!=desde) siguiente=salasPrevias[siguiente]
        return siguiente
    }
    function empezarRonda() {
        brummi.comportamiento=Comportamiento.Ronda; brummi.temporizadorMs=0; brummi.taquillaObservada=-1
        let destino=1+azar(11)
        if(destino==brummi.sala) destino=destino%11+1
        brummi.salaDestino=destino; brummi.destinoX=76; brummi.destinoY=76; brummi.edadRutaMs=1000
    }
    function seguirAlPersonaje() {
        if(brummi.comportamiento!=Comportamiento.Seguir) { vecesDescubierto++; pedirSonido(5,4) }
        brummi.comportamiento=Comportamiento.Seguir; brummi.sinVerMs=0; brummi.esperaMs=0
        brummi.salaDestino=sala; brummi.destinoX=personajeX; brummi.destinoY=personajeY
    }
    // Brummi solo quiere fusibles: si el personaje no lleva ninguno, no lo sigue.
    function quiereFusible(): boolean { return llevados > 0 || SEGUIR_VACIO > 0 }
    // Brummi ha alcanzado al personaje. Toma el último fusible recogido y lo devuelve a su sitio; los fusibles que ya
    // están en el generador se quedan allí. texto: el texto del mensaje, o "" para el mensaje normal.
    function ordenar(texto: string) {
        contactos++; respiroMs = RESPIRO_MS
        brummi.vistoMs = 0; brummi.taquillaObservada = -1; brummi.sinVerMs = 0
        if (llevados > 0 && bolsa.length > 0) {
            let numero = bolsa.pop(); llevados--; fusiblesRetirados++; colocando = false; colocacionMs = 0
            brummi.comportamiento = Comportamiento.Devolver; brummi.numeroFusible = numero; brummi.esperaMs = 600
            brummi.salaDestino = cosas[numero].sala; brummi.destinoX = cosas[numero].x
            brummi.destinoY = cosas[numero].y; brummi.edadRutaMs = 1000
            mostrarMensaje(texto == "" ? "¡BRUMMI TOMA 1 FUSIBLE!" : texto); pedirSonido(25, 4)
        } else tocarSinFusible()
    }
    // Contacto sin fusible: no pasa nada, Brummi sigue su camino y se queda contento un rato.
    function tocarSinFusible() {
        empezarRonda(); contentoMs = CONTENTO_MS; brummi.esperaMs = 800
        mostrarMensaje("NADA QUE ORDENAR."); pedirSonido(26, 3)
    }
    // Brummi deja el fusible donde lo encontró, espera y empieza una ronda nueva. Cuantos más fusibles haya devuelto ya
    // en esta noche, más tiempo se queda contento (un jugador lento no pierde siempre el mismo fusible). El mensaje
    // dice en qué sala ha vuelto el fusible (dibujo de fusible y nombre de la sala), salvo que se esté mostrando un
    // aviso de la lámpara.
    function dejar() {
        if (brummi.numeroFusible >= 0) {
            let cosa = cosas[brummi.numeroFusible]
            cosa.tomada = false
            if (!(tiempoMensajeMs > 0 && mensajeEspera)) {
                mostrarMensaje(salas[cosa.sala].nombreSala)
                iconoMensaje = true
            }
        }
        brummi.numeroFusible = -1; empezarRonda(); brummi.esperaMs = 1500; pedirSonido(28, 2)
        contentoMs = Math.min(CONTENTO_MAX_MS,
            CONTENTO_MS + CONTENTO_PLUS_MS * Math.max(0, fusiblesRetirados - 1))
    }
    function calcularCaminoBrummi(destinoX: number, destinoY: number) {
        let columnaInicial=Math.floor(brummi.x/8),filaInicial=Math.floor(brummi.y/8),
            columnaMeta=Math.floor(destinoX/8),filaMeta=Math.floor(destinoY/8)
        let casillaMeta=brummi.sala*300+filaMeta*20+columnaMeta
        if(numeroCasillaCamino!=casillaMeta) {
        numeroCasillaCamino=casillaMeta;calculosCamino++;distanciasCamino.fill(0)
        let posicionLectura=0,posicionEscritura=1,baldosaMeta=filaMeta*20+columnaMeta
        colaCamino.setNumber(NumberFormat.UInt16LE,0,baldosaMeta)
        distanciasCamino.setNumber(NumberFormat.UInt16LE,baldosaMeta*2,1)
        while(posicionLectura<posicionEscritura) {
            let numeroBaldosa=colaCamino.getNumber(NumberFormat.UInt16LE,posicionLectura++*2),
                x=numeroBaldosa%20,y=Math.floor(numeroBaldosa/20)
            let distanciaBaldosa=distanciasCamino.getNumber(NumberFormat.UInt16LE,numeroBaldosa*2)
            for(let direccion=0;direccion<4;direccion++) {
                let columnaVecina=x+(direccion==0?1:direccion==2?-1:0),
                    filaVecina=y+(direccion==1?1:direccion==3?-1:0),siguiente=filaVecina*20+columnaVecina
                if(!esMuro(brummi.sala,columnaVecina,filaVecina)
                    && distanciasCamino.getNumber(NumberFormat.UInt16LE,siguiente*2)==0) {
                    distanciasCamino.setNumber(NumberFormat.UInt16LE,siguiente*2,distanciaBaldosa+1)
                    colaCamino.setNumber(NumberFormat.UInt16LE,posicionEscritura++*2,siguiente)
                }
            }
        }
        }
        let mejor=distanciasCamino.getNumber(NumberFormat.UInt16LE,(filaInicial*20+columnaInicial)*2)
        brummi.rutaX=brummi.x; brummi.rutaY=brummi.y
        if(columnaInicial==columnaMeta && filaInicial==filaMeta) { brummi.rutaX=destinoX;brummi.rutaY=destinoY;return }
        for(let direccion=0;direccion<4;direccion++) {
            let columnaVecina=columnaInicial+(direccion==0?1:direccion==2?-1:0),
                filaVecina=filaInicial+(direccion==1?1:direccion==3?-1:0)
            if(esMuro(brummi.sala,columnaVecina,filaVecina)) continue
            let distanciaVecina=distanciasCamino.getNumber(NumberFormat.UInt16LE,(filaVecina*20+columnaVecina)*2)
            if(distanciaVecina>0 && (distanciaVecina<mejor || mejor==0)) {
                mejor=distanciaVecina
                brummi.rutaX=columnaVecina*8+4
                brummi.rutaY=filaVecina*8+4
            }
        }
    }
    function moverBrummi(dt: number) {
        if(brummi.esperaMs>0) {brummi.esperaMs-=dt;return}
        let destinoX=brummi.destinoX,destinoY=brummi.destinoY,siguiente=brummi.sala,ladoPuerta=-1
        if(brummi.salaDestino!=brummi.sala) {
            siguiente=proximaSala(brummi.sala,brummi.salaDestino,false)
            if(siguiente==brummi.sala) {
                if(brummi.comportamiento==Comportamiento.Devolver)dejar()
                else empezarRonda()
                return
            }
            for(let direccion=0;direccion<4;direccion++) if(salas[brummi.sala].puertas[direccion]==siguiente)
                ladoPuerta=direccion
            destinoX=ladoPuerta==0?156:ladoPuerta==2?4:76;destinoY=ladoPuerta==1?116:ladoPuerta==3?4:60
        }
        brummi.edadRutaMs+=dt
        let numeroCasilla=Math.floor(destinoX/8)+Math.floor(destinoY/8)*20+brummi.sala*300
        if(brummi.edadRutaMs>=200 || Math.abs(brummi.x-brummi.rutaX)+Math.abs(brummi.y-brummi.rutaY)<1
            || brummi.numeroCasillaDestino!=numeroCasilla) {
            calcularCaminoBrummi(destinoX,destinoY);brummi.edadRutaMs=0;brummi.numeroCasillaDestino=numeroCasilla
        }
        let dx=brummi.rutaX-brummi.x,dy=brummi.rutaY-brummi.y,distancia=Math.sqrt(dx*dx+dy*dy)
        let velocidad=brummi.comportamiento==Comportamiento.Seguir?VELOCIDAD_SEGUIR+instalados*PLUS_SEGUIR:
            brummi.comportamiento==Comportamiento.Devolver?VELOCIDAD_LLEVAR
                :brummi.comportamiento==Comportamiento.Ronda?30:brummi.comportamiento==Comportamiento.Mirar?50:45
        if(distancia>0.1) {
            brummi.dx=dx/distancia;brummi.dy=dy/distancia
            let trayecto=Math.min(distancia,velocidad*dt/1000)
            brummi.x+=brummi.dx*trayecto;brummi.y+=brummi.dy*trayecto
        }
        if(ladoPuerta>=0 && Math.abs(brummi.x-destinoX)+Math.abs(brummi.y-destinoY)<2) {
            brummi.sala=siguiente;brummi.x=ladoPuerta==0?4:ladoPuerta==2?156:76
            brummi.y=ladoPuerta==1?4:ladoPuerta==3?116:60;brummi.edadRutaMs=1000
        } else if(ladoPuerta<0 && Math.abs(brummi.x-destinoX)+Math.abs(brummi.y-destinoY)<3) {
            if(brummi.comportamiento==Comportamiento.Ronda) {empezarRonda();brummi.esperaMs=instalados>=2?1000:2000}
            else if(brummi.comportamiento==Comportamiento.Curioso) {
                brummi.temporizadorMs+=dt
                if(brummi.temporizadorMs>=3000)empezarRonda()
            }
            else if(brummi.comportamiento==Comportamiento.Devolver) dejar()
        }
    }
    function actualizarBrummi(dt: number) {
        if(brummi.comportamiento==Comportamiento.EstacionCarga) {
            if(brummi.despertarRestanteMs>0) {
                brummi.despertarRestanteMs-=dt
                if(brummi.despertarRestanteMs<=0)empezarRonda()
            }
            return
        }
        if(brummi.comportamiento==Comportamiento.Escuchar) {
            brummi.temporizadorMs-=dt
            if(brummi.temporizadorMs<=0) {
                brummi.comportamiento=Comportamiento.Curioso
                brummi.temporizadorMs=0
                brummi.edadRutaMs=1000
            }
            return
        }
        // Brummi devuelve un fusible: solo rueda y no se fija en nada.
        if(brummi.comportamiento==Comportamiento.Devolver) {moverBrummi(dt);return}
        let personajeVisto=veAlPersonaje(),quiere=quiereFusible()
        if(personajeVisto && quiere) {
            brummi.vistoMs+=dt
            let dx=personajeX-brummi.x,dy=personajeY-brummi.y
            if(brummi.vistoMs>=600 || dx*dx+dy*dy<=144 || brummi.comportamiento==Comportamiento.Seguir)
                seguirAlPersonaje()
        } else brummi.vistoMs=0
        // Ya no queda nada que ordenar (por ejemplo porque el último fusible está en el generador): deja
        // de seguir enseguida.
        if(!quiere && (brummi.comportamiento==Comportamiento.Seguir || brummi.comportamiento==Comportamiento.Mirar))
            empezarRonda()
        // Escondite: Brummi ha visto al personaje entrar en la taquilla y lo encuentra allí.
        if(brummi.taquillaObservada==taquillaEscondida && taquillaEscondida>=0 && brummi.sala==sala
            && Math.abs(brummi.x-personajeX)+Math.abs(brummi.y-personajeY)<10) {
            taquillaEscondida=-1;ordenar("¡TE ENCONTRÓ! ¡A ORDENAR!");return
        }
        if(brummi.comportamiento==Comportamiento.Seguir && !personajeVisto) {
            brummi.sinVerMs+=dt
            if(brummi.sinVerMs>=2000) {brummi.comportamiento=Comportamiento.Mirar;brummi.temporizadorMs=MIRAR_MS}
        }
        if(brummi.comportamiento==Comportamiento.Mirar) {
            brummi.temporizadorMs-=dt
            if(brummi.temporizadorMs<=0) empezarRonda()
            else if(brummi.sala==brummi.salaDestino
                && Math.abs(brummi.x-brummi.destinoX)+Math.abs(brummi.y-brummi.destinoY)<5) {
                let x=Math.max(12,Math.min(148,brummi.destinoX+azar(65)-32)),
                    y=Math.max(20,Math.min(100,brummi.destinoY+azar(65)-32))
                if(puedePisar(brummi.sala,x,y)) {brummi.destinoX=x;brummi.destinoY=y;brummi.edadRutaMs=1000}
            }
        }
        // Una mancha de luz solo hace que Brummi sienta curiosidad; nunca muestra de dónde viene.
        if(lampara && contentoMs<=0 && brummi.sala==sala && sala!=0
            && brummi.comportamiento==Comportamiento.Ronda && !personajeVisto) {
            for(let distancia=16;distancia<=64;distancia+=16) {
                let x=personajeX+orientacionX*distancia,y=personajeY+orientacionY*distancia
                if(!esMuro(sala,Math.floor(x/8),Math.floor(y/8)) && esVisible(x,y)
                    && enHaz(brummi.x,brummi.y,brummi.dx,brummi.dy,x,y,72,0.819)
                    && tieneVista(sala,brummi.x,brummi.y,x,y)) {
                    brummi.esperaMs=0;brummi.comportamiento=Comportamiento.Curioso;brummi.salaDestino=sala
                    brummi.destinoX=x;brummi.destinoY=y;brummi.temporizadorMs=0;break
                }
            }
        }
        moverBrummi(dt)
        if(respiroMs<=0 && contentoMs<=0 && taquillaEscondida<0 && brummi.sala==sala && sala!=0
            && Math.abs(brummi.x-personajeX)<6 && Math.abs(brummi.y-personajeY)<6) ordenar("")
    }
    export function buscarCosa(): number {
        if(taquillaEscondida>=0)return taquillaEscondida
        let mejor=-1,mejorDistancia=100000
        for(let i=0;i<cosas.length;i++) {
            let cosa=cosas[i]
            if(cosa.sala!=sala || cosa.tomada)continue
            let dx=cosa.x-personajeX,dy=cosa.y-personajeY,distanciaCuadrada=dx*dx+dy*dy
            // La imagen del generador mide 19 x 17 píxeles (el cuerpo, 17 x 14). Para ponerse delante de su panel no
            // hace falta tocar el dibujo ni mirar su centro.
            let alcance=cosa.tipo==TipoCosa.Generador ? 18 : 11
            let deFrente=cosa.tipo==TipoCosa.Generador || distanciaCuadrada<=25 || dx*orientacionX+dy*orientacionY>=0
            if(distanciaCuadrada<alcance*alcance && distanciaCuadrada<mejorDistancia && deFrente
                && tieneVista(sala,personajeX,personajeY,cosa.x,cosa.y)) {
                mejorDistancia=distanciaCuadrada
                mejor=i
            }
        }
        return mejor
    }
    function usar() {
        if(taquillaEscondida>=0) {
            taquillaEscondida=-1;hacerRuido(4,personajeX,personajeY,sala);pedirSonido(3,2)
            if(estado==Estado.Practica && paso==5 && progreso>0)pasarAlSiguientePaso()
            return
        }
        elegido=buscarCosa()
        if(elegido<0)return
        // Desde el paso 07 de la práctica, A solo recoge la batería del paso 12.
        if(estado==Estado.Practica && paso>=6 && !(paso==11 && cosas[elegido].tipo==TipoCosa.Bateria))return
        let cosa=cosas[elegido]
        if(estado==Estado.Practica && (paso<3 || paso==3 && cosa.tipo!=TipoCosa.Fusible
            || paso==4 && cosa.tipo!=TipoCosa.Generador || paso==5 && cosa.tipo!=TipoCosa.Taquilla))return
        if(cosa.tipo==TipoCosa.Fusible) {
            if(llevados>=3) {mostrarMensaje("BOLSA LLENA  3/3");return}
            cosa.tomada=true;llevados++;bolsa.push(elegido);pedirSonido(2,2)
            if(brummi.comportamiento==Comportamiento.EstacionCarga && brummi.despertarRestanteMs==0) {
                brummi.despertarRestanteMs=DESPERTAR_MS;mostrarMensaje("¡BIP! BRUMMI DESPIERTA.");pedirSonido(7,3)
            }
            if(estado==Estado.Practica && paso==3)pasarAlSiguientePaso()
        } else if(cosa.tipo==TipoCosa.Bateria) {
            if(carga>=100) {mostrarMensaje("BATERÍA LLENA");return}
            carga=Math.min(100,carga+GANANCIA_BATERIA);avisosDados=0
            cosa.tomada=true;pedirSonido(2,2);mostrarMensaje("BATERÍA RECOGIDA")
            if(estado==Estado.Practica && paso==11)pasarAlSiguientePaso()
        } else if(cosa.tipo==TipoCosa.Taquilla) {
            let observado=veAlPersonaje()
            taquillaEscondida=elegido;personajeX=cosa.x;personajeY=cosa.y;lampara=false
            // El escondite solo funciona con un fusible; sin fusible, Brummi solo echa un vistazo («?») y
            // no cuenta nada.
            if(observado && quiereFusible()) {
                seguirAlPersonaje()
                brummi.taquillaObservada=taquillaEscondida
                brummi.edadRutaMs=1000
            }
            else if(observado) {
                brummi.esperaMs=0;brummi.comportamiento=Comportamiento.Curioso;brummi.salaDestino=sala
                brummi.destinoX=personajeX;brummi.destinoY=personajeY;brummi.temporizadorMs=0;brummi.edadRutaMs=1000
            }
            hacerRuido(4,personajeX,personajeY,sala);pedirSonido(3,2)
            if(estado==Estado.Practica && paso==5)progreso=1
        } else if(cosa.tipo==TipoCosa.Generador) {
            if(llevados<=0)mostrarMensaje("BUSCA FUSIBLES")
            else {colocando=true;colocacionMs=0;relojRuidoColocacionMs=500;if(!mensajeEspera)tiempoMensajeMs=0}
        } else mostrarMensaje(instalados<5?"SIN CORRIENTE. 5 FUSIBLES.":"ASCENSOR LISTO")
    }
    function pasarAlSiguientePaso() {
        paso++;edadPasoMs=0;progreso=0;pedirSonido(2,2)
        if(paso>=6 && paso<=9) {
            // Preparar cada demostración sin peligro una sola vez, al entrar en el paso.
            personajeX=92;personajeY=76;orientacionX=1;orientacionY=0;taquillaEscondida=-1;lampara=true
            brummi.sala=0;brummi.x=124;brummi.y=76;brummi.dx=-1;brummi.dy=0
            brummi.comportamiento=Comportamiento.Ronda;brummi.vistoMs=0;brummi.taquillaObservada=-1
            carga=100;pausaSilbatoMs=0;bMantenidaMs=0;bActivada=false
            llevados=1 // fusible de práctica: Brummi quiere fusibles (la práctica nunca se lo lleva)
        }
        if(paso==8)lampara=false
        if(paso==11) {
            // Lección de la lámpara: la batería de práctica no aparece hasta ahora, justo donde estaba Brummi; él se
            // hace a un lado para dejarle sitio.
            llevados=0;carga=BATERIA_PRACTICA;pausaSilbatoMs=0
            cosas.push(new Cosa(0,124,76,TipoCosa.Bateria))
            brummi.comportamiento=Comportamiento.Ronda;brummi.x=144;brummi.y=92;brummi.dx=-1;brummi.dy=0
        }
    }
    function silbar() {
        if(taquillaEscondida>=0) {mostrarMensaje("IMPOSIBLE EN LA TAQUILLA");return}
        if(pausaSilbatoMs>0) {mostrarMensaje("¡PRIMERO TOMA AIRE!");return}
        // Brummi devuelve un fusible y no oye nada: el silbato no serviría de nada, así que no cuesta nada; un sonido
        // corto lo indica.
        if(brummi.comportamiento==Comportamiento.Devolver) {pedirSonido(26,3);return}
        // El silbato no gasta energía, no hace falta apuntar y llega hasta detrás de las esquinas.
        silbidos++;efectoSilbatoMs=300;pausaSilbatoMs=PAUSA_SILBATO_MS;colocando=false;colocacionMs=0
        pedirSonido(4,3)
        let distanciaX=brummi.x-personajeX,distanciaY=brummi.y-personajeY
        if(brummi.comportamiento==Comportamiento.EstacionCarga || brummi.sala!=sala
            || distanciaX*distanciaX+distanciaY*distanciaY>ALCANCE_SILBATO*ALCANCE_SILBATO)
            hacerRuido(6,personajeX,personajeY,sala)
        else {
            brummi.comportamiento=Comportamiento.Escuchar
            brummi.temporizadorMs=PARAR_SILBATO_MS;brummi.taquillaObservada=-1
            brummi.salaDestino=sala;brummi.destinoX=personajeX
            brummi.destinoY=personajeY;brummi.vistoMs=0;pedirSonido(8,4)
            if(estado==Estado.Practica && paso==9)pasarAlSiguientePaso()
        }
    }
    function puedePisar(numeroSala: number,x: number,y: number): boolean {
        return !esMuro(numeroSala,Math.floor((x-2)/8),Math.floor((y-2)/8))
            && !esMuro(numeroSala,Math.floor((x+2)/8),Math.floor((y-2)/8))
            && !esMuro(numeroSala,Math.floor((x-2)/8),Math.floor((y+2)/8))
            && !esMuro(numeroSala,Math.floor((x+2)/8),Math.floor((y+2)/8))
    }
    function moverPersonaje(dx: number,dy: number) {
        let nuevaX=personajeX+dx,nuevaY=personajeY+dy,direccion=-1
        if(nuevaX<3 && salas[sala].puertas[2]>=0 && personajeY>=58 && personajeY<=70)direccion=2
        if(nuevaX>157 && salas[sala].puertas[0]>=0 && personajeY>=58 && personajeY<=70)direccion=0
        if(nuevaY<3 && salas[sala].puertas[3]>=0 && personajeX>=74 && personajeX<=86)direccion=3
        if(nuevaY>117 && salas[sala].puertas[1]>=0 && personajeX>=74 && personajeX<=86)direccion=1
        if(direccion>=0) {
            let salaDestino=salas[sala].puertas[direccion], destinoX=direccion==0?4:direccion==2?156:personajeX,
                destinoY=direccion==1?4:direccion==3?116:personajeY
            sala=salaDestino;personajeX=destinoX;personajeY=destinoY
            salas[sala].visitada=true;transicionMs=600;relojRadarMs=200
            if(sala==0 && instalados==5)terminar(true,"")
            return
        }
        if(puedePisar(sala,nuevaX,personajeY))personajeX=nuevaX
        if(puedePisar(sala,personajeX,nuevaY))personajeY=nuevaY
    }
    export function terminar(exito: boolean,motivo: string) {
        ganado=exito;motivoFin=motivo;entrarEstado(Estado.Resultado);pedirSonido(exito?9:6,5)
    }
    // Botón de menú: abre la pausa y la cierra. Desde la práctica, el cursor empieza en «SALTAR PRÁCTICA»: basta con
    // pulsar A una vez para saltarla.
    export function alternarPausa() {
        if(estado==Estado.Pausa) {entrarEstado(estadoAnterior);return}
        if(estado==Estado.Partida || estado==Estado.Practica) {
            estadoAnterior=estado;entrarEstado(Estado.Pausa);if(estadoAnterior==Estado.Practica)menu=1
        }
    }
    export function actualizar(dt: number,teclas: number) {
        dt=Math.min(50,Math.max(0,dt));edadMs+=dt;transcurridoMs+=dt
        let pulsadas=teclas & ~ultimasTeclas,soltadas=ultimasTeclas & ~teclas;ultimasTeclas=teclas
        if(pulsadas&16)aPulsadaMs=transcurridoMs
        if(pulsadas&32)bPulsadaMs=transcurridoMs
        efectoRestanteMs-=dt;if(efectoRestanteMs<=0)prioridadEfecto=0
        if(estado==Estado.Intro) {
            // A o B: primero hacia la tarjeta y, desde la tarjeta (pasado 1,5 s), hacia el menú del título.
            if(edadMs>=duracionIntroMs)entrarEstado(Estado.Titulo)
            else if(edadMs>500 && (pulsadas&48)!=0) {
                if(edadMs<INICIO_TARJETA_MS)edadMs=INICIO_TARJETA_MS
                else if(edadMs>=INICIO_TARJETA_MS+BLOQUEO_TARJETA_MS)entrarEstado(Estado.Titulo)
            }
            return
        }
        // Los menús ignoran las pulsaciones durante 500 ms después de abrirse: si pulsas A muy rápido, no acabas en
        // otro sitio por casualidad.
        if((estado==Estado.Titulo || estado==Estado.OfertaPractica) && edadMs<500)return
        if(estado==Estado.Titulo) {
            if(pulsadas&1 || pulsadas&4) {menu=(menu+3)%4;pedirSonido(1,1)}
            if(pulsadas&2 || pulsadas&8) {menu=(menu+1)%4;pedirSonido(1,1)}
            if(pulsadas&16) {
                if(menu==0)entrarEstado(Estado.OfertaPractica)
                if(menu==1)empezar(numeroMina,true)
                if(menu==2)reducido=!reducido
                if(menu==3)mudo=!mudo
            }
            return
        }
        if(estado==Estado.OfertaPractica) {
            if(pulsadas&16)empezar(numeroMina,true)
            else if(pulsadas&32)empezar(numeroMina,false)
            return
        }
        if(estado==Estado.Pausa) {
            if(pulsadas&1 || pulsadas&4)menu=(menu+3)%4
            if(pulsadas&2 || pulsadas&8)menu=(menu+1)%4
            if(pulsadas&16) {
                if(menu==0)entrarEstado(estadoAnterior)
                else if(menu==1) {if(estadoAnterior==Estado.Practica)empezar(numeroMina,false);else reducido=!reducido}
                else if(menu==2)mudo=!mudo
                else entrarEstado(Estado.Titulo)
            }
            return
        }
        if(estado==Estado.Resultado) {
            if(edadMs>600 && pulsadas&16)empezar(numeroMina,false)
            else if(edadMs>600 && pulsadas&32)empezar((numeroMina+7919)%99999+1,false)
            return
        }
        // La pausa con A + B solo cuenta si las dos teclas se pulsan a la vez; si no, B silba y A corre.
        let comboPausa=(teclas&48)==48 && Math.abs(aPulsadaMs-bPulsadaMs)<=COMBO_PAUSA_MS
        if(comboPausa) {
            comboMs+=dt;colocando=false;colocacionMs=0;bMantenidaMs=0;bActivada=true;aBloqueada=true
            if(comboMs>=900) {alternarPausa();return}
        } else comboMs=0
        // Durante la práctica la lámpara siempre está llena: puedes intentarlo las veces que quieras. Solo la lección
        // de la lámpara (paso 12) muestra una lámpara medio gastada.
        if(estado==Estado.Practica && paso<11)carga=100
        if(!(teclas&16))aBloqueada=false
        tiempoMs+=dt;efectoSilbatoMs=Math.max(0,efectoSilbatoMs-dt);pausaSilbatoMs=Math.max(0,pausaSilbatoMs-dt)
        respiroMs=Math.max(0,respiroMs-dt);contentoMs=Math.max(0,contentoMs-dt)
        // Mientras se coloca un fusible, la línea de abajo muestra la barra de progreso; un aviso de la lámpara espera.
        if(!colocando || !mensajeEspera)tiempoMensajeMs=Math.max(0,tiempoMensajeMs-dt)
        ultimoRuidoMs=Math.max(0,ultimoRuidoMs-dt);transicionMs=Math.max(0,transicionMs-dt)
        let dx=(teclas&2?1:0)-(teclas&1?1:0),dy=(teclas&8?1:0)-(teclas&4?1:0)
        let seMueve=dx!=0 || dy!=0, corre=seMueve && (teclas&16)!=0
        if(seMueve && taquillaEscondida<0) {
            let longitud=Math.sqrt(dx*dx+dy*dy);orientacionX=dx/longitud;orientacionY=dy/longitud
            let trayecto=(corre?92:45)*dt/1000
            let anteriorX=personajeX,anteriorY=personajeY,salaAnterior=sala
            moverPersonaje(orientacionX*trayecto,orientacionY*trayecto)
            let seHaMovido=anteriorX!=personajeX || anteriorY!=personajeY || salaAnterior!=sala
            relojRuidoMs=seHaMovido?relojRuidoMs+dt:0
            if(relojRuidoMs>=400) {
                relojRuidoMs=0
                hacerRuido(baldosa(sala,Math.floor(personajeX/8),Math.floor(personajeY/8))==2?8:corre?10:3,
                    personajeX,personajeY,sala)
                if(seHaMovido)pedirSonido(corre?11:20,1)
            }
            if(estado==Estado.Practica && (paso==2 || paso==8) && corre && seHaMovido)progreso+=dt
        }
        if((estado as number)==Estado.Resultado)return
        if(!comboPausa && pulsadas&16 && !seMueve && !aBloqueada) {aBloqueada=true;usar()}
        if(colocando) {
            if(!(teclas&16) || seMueve || taquillaEscondida>=0) {colocando=false;colocacionMs=0}
            else {
                colocacionMs+=dt;relojRuidoColocacionMs+=dt
                if(relojRuidoColocacionMs>=500) {
                    relojRuidoColocacionMs=0
                    hacerRuido(12,personajeX,personajeY,sala)
                    pedirSonido(3,1)
                }
                if(colocacionMs>=3000) {
                    instalados++;llevados--;bolsa.shift();colocacionMs=0;colocando=false;pedirSonido(12,3)
                    if(estado==Estado.Practica && paso==4)pasarAlSiguientePaso()
                    else if(instalados==5) {
                        mostrarMensaje("¡CORRIENTE! ¡AL ASCENSOR!")
                        if(brummi.comportamiento!=Comportamiento.Seguir
                            && brummi.comportamiento!=Comportamiento.Escuchar) {
                            brummi.comportamiento=Comportamiento.Curioso;brummi.salaDestino=4;brummi.destinoX=76
                            brummi.destinoY=52;brummi.temporizadorMs=0;brummi.edadRutaMs=1000
                        }
                    }
                }
            }
        }
        if(!comboPausa && teclas&32) {bMantenidaMs+=dt;if(bMantenidaMs>=350 && !bActivada) {bActivada=true;silbar()}}
        if(soltadas&32) {
            if(!bActivada && bMantenidaMs>0 && taquillaEscondida<0) {lampara=!lampara;pedirSonido(1,1)}
            bMantenidaMs=0;bActivada=false
        }
        if(!(teclas&32) && !(soltadas&32)) {bMantenidaMs=0;bActivada=false}
        // La lámpara es el reloj de la noche: lámpara vacía = noche terminada. Cuando los cinco fusibles están en el
        // generador, la lámpara ya no gasta nada: ahora alumbra el generador.
        if(estado==Estado.Partida) {
            if(instalados<5)carga=Math.max(0,carga-(lampara?CONSUMO_HAZ:CONSUMO_REPOSO)*dt/1000)
            if(carga<=AVISO_LAMPARA_1 && avisosDados<1) {
                avisosDados=1;mostrarMensaje("LA LÁMPARA SE AGOTA.");mensajeEspera=true;pedirSonido(27,2)
            }
            if(carga<=AVISO_LAMPARA_2 && avisosDados<2) {
                avisosDados=2;mostrarMensaje("¡CASI VACÍA! ¿UNA BATERÍA?");mensajeEspera=true;pedirSonido(27,3)
            }
            if(carga<=0) {lampara=false;terminar(false,"LA LÁMPARA ESTÁ VACÍA.");return}
        }
        elegido=buscarCosa()
        if(estado==Estado.Practica) {
            edadPasoMs+=dt
            if(brummi.comportamiento==Comportamiento.Escuchar) {
                brummi.temporizadorMs=Math.max(0,brummi.temporizadorMs-dt)
                if(brummi.temporizadorMs==0)brummi.comportamiento=Comportamiento.Ronda
            }
            // Paso 07: Brummi pita desde una distancia fija de 4 baldosas y la antena del panel parpadea.
            destelloPitidoMs=Math.max(0,destelloPitidoMs-dt)
            if(paso==6) {
                distanciaPitido=4;pitidoRestanteMs-=dt
                if(pitidoRestanteMs<=0) {
                    pitidoRestanteMs=PITIDO_CERCA_MS+2*PITIDO_POR_BALDOSA_MS
                    destelloPitidoMs=160
                    pedirSonido(13,2)
                }
            }
            else distanciaPitido=999
            if(paso==0 && Math.abs(personajeX-116)+Math.abs(personajeY-76)<10)pasarAlSiguientePaso()
            else if(paso==1 && lampara)pasarAlSiguientePaso()
            else if(paso==2 && progreso>=2000)pasarAlSiguientePaso()
            else if(paso==6 && edadPasoMs>700 && pulsadas&16)pasarAlSiguientePaso()
            else if(paso==7) {
                brummi.vistoMs=lampara?Math.min(600,edadPasoMs):0
                if(!lampara && edadPasoMs>300)pasarAlSiguientePaso()
            } else if(paso==8) {
                if(ultimoRuidoMs>0)brummi.comportamiento=Comportamiento.Curioso
                if(progreso>=1000)pasarAlSiguientePaso()
            } else if(paso==10) {
                if(personajeX<48 && personajeY>60 && personajeY<90)pasarAlSiguientePaso()
            } else if(paso==12 && edadPasoMs>700 && pulsadas&16)empezar(numeroMina,false)
            return
        }
        actualizarBrummi(dt)
        relojRadarMs+=dt
        if(relojRadarMs>=200) {
            relojRadarMs=0
            distanciaPitido=brummi.comportamiento==Comportamiento.EstacionCarga?999
                :caminoSonoro(sala,personajeX,personajeY,brummi.sala,brummi.x,brummi.y,12)
        }
        destelloPitidoMs=Math.max(0,destelloPitidoMs-dt);pitidoRestanteMs-=dt
        if(distanciaPitido<=12 && pitidoRestanteMs<=0) {
            pitidoRestanteMs=PITIDO_CERCA_MS+Math.max(0,distanciaPitido-2)*PITIDO_POR_BALDOSA_MS
            destelloPitidoMs=160;pedirSonido(13,2)
        }
        sonidoAmbienteMs+=dt
        if(sonidoAmbienteMs>=14000) {sonidoAmbienteMs=0;pedirSonido(14,1)}
    }
}
