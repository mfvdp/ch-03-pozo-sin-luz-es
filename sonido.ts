// Una música amable y un ambiente suave de mina; cada voz termina por apagarse.
// Instrucciones del mezclador de Arcade: 1 = triángulo, 3 = seno, 18 = ruido (WaveShape.Noise, un ruido de ciclo del
// sintetizador; el ruido blanco sería 5). Las amplitudes van de 0 a 1023. Regla del sonido (sin sobresaltos): un pico
// por encima de 400 necesita un ataque de al menos 100 ms; los instrumentos de percusión se quedan en 400 o menos.
namespace NocheSonido {
    let sonidos: Buffer[] = []
    let duracionesMs: number[] = []
    let ocupadoHastaMs = 0
    let prioridad = 0
    let estadoAnterior = -1
    let edadAnteriorMs = -1
    let silenciado = false
    let numeroSonidoIntro = 0
    // Los cortes, los momentos fuertes de la historia y la tarjeta del estudio comparten una sola línea de tiempo (el
    // tiempo de la película). Viento, pestillo, cabina, chispas, apagado suave, pitido, pitidos que suben, monitor que
    // se enciende, oleada del estudio, campanita, firma, título.
    const momentosSonidosMs = [700, 5300, 7200, 10800, 15500, 19000, 21300, 23400, 25600, 26950, 28500, 34600]
    const numerosSonidos = [15, 3, 16, 17, 19, 13, 30, 22, 23, 29, 24, 18]
    let numeroMusica = 0
    let vocesMusica: Buffer[] = []
    // 180 pulsos por minuto: 36 corcheas por cada parte de seis segundos. El ritmo de las imágenes, en
    // cambio, no cambia.
    const corcheaMs = 1000 / 6
    // Cinco voces dejan tres canales libres para la firma del estudio.
    const momentosMusicaMs = [500,6500,12500,18500,24500,30500,36500,42500,48500,54500,60500]
    const duracionesMusicaMs = [6000,6000,6000,6000,6000,6000,6000,6000,6000,6000,3000]
    let ambientes: Buffer[] = []
    let zumbido: Buffer[] = []
    let proximoAmbienteMs = 0
    let proximoZumbidoMs = 0
    let numeroAmbiente = 0
    let pisadaAgua: Buffer
    let pisadaMetal: Buffer
    let pisadaAguaCorriendo: Buffer
    let pisadaMetalCorriendo: Buffer
    let acordeGrave: Buffer
    let acordeAgudo: Buffer

    function escribirSegmento(bufer: Buffer, desplazamiento: number, formaOnda: number, duracionMs: number,
        desdeHz: number, hastaHz: number, desdeVolumen: number, hastaVolumen: number) {
        bufer.setUint8(desplazamiento, formaOnda)
        bufer.setNumber(NumberFormat.UInt16LE, desplazamiento + 2, desdeHz)
        bufer.setNumber(NumberFormat.UInt16LE, desplazamiento + 4, duracionMs)
        bufer.setNumber(NumberFormat.UInt16LE, desplazamiento + 6, desdeVolumen)
        bufer.setNumber(NumberFormat.UInt16LE, desplazamiento + 8, hastaVolumen)
        bufer.setNumber(NumberFormat.UInt16LE, desplazamiento + 10, hastaHz)
    }
    function construirEnvolvente(formaOnda: number, desdeHz: number, hastaHz: number,
        pico: number, ataqueMs: number, duracionMs: number): Buffer {
        let datos = control.createBuffer(36)
        let medio = Math.round(desdeHz + (hastaHz - desdeHz) * ataqueMs / duracionMs)
        escribirSegmento(datos, 0, formaOnda, ataqueMs, desdeHz, medio, 0, pico)
        escribirSegmento(datos, 12, formaOnda, duracionMs - ataqueMs, medio, hastaHz, pico, 0)
        // Una última instrucción en cero cierra el búfer. Así ningún sonido sigue después de su final previsto.
        return datos
    }
    function anadirSonido(formaOnda: number, desdeHz: number,
        hastaHz: number, pico: number, ataqueMs: number, duracionMs: number) {
        sonidos.push(construirEnvolvente(formaOnda, desdeHz, hastaHz, pico, ataqueMs, duracionMs))
        duracionesMs.push(duracionMs)
    }
    // Una melodía corta en un canal: tríos de tono inicial, tono final y duración, con un pico por nota. Un tono
    // inicial 0 es un silencio. Cada nota sube desde cero y vuelve a caer a cero.
    function anadirMelodia(formaOnda: number, notas: number[], picos: number[], ataqueMs: number) {
        let cantidad = notas.length / 3
        let datos = control.createBuffer((cantidad * 2 + 1) * 12)
        let totalMs = 0
        for (let i = 0; i < cantidad; i++) {
            let desdeHz = notas[i * 3], hastaHz = notas[i * 3 + 1], notaMs = notas[i * 3 + 2], desplazamiento = i * 24
            totalMs += notaMs
            if (desdeHz == 0) {
                escribirSegmento(datos, desplazamiento, formaOnda, notaMs - 1, 1, 1, 0, 0)
                escribirSegmento(datos, desplazamiento + 12, formaOnda, 1, 1, 1, 0, 0)
                continue
            }
            let medio = Math.round(desdeHz + (hastaHz - desdeHz) * ataqueMs / notaMs)
            escribirSegmento(datos, desplazamiento, formaOnda, ataqueMs, desdeHz, medio, 0, picos[i])
            escribirSegmento(datos, desplazamiento + 12, formaOnda, notaMs - ataqueMs, medio, hastaHz, picos[i], 0)
        }
        sonidos.push(datos)
        duracionesMs.push(totalMs)
    }
    function anadirTonada(formaOnda: number, notas: number[], pico: number, ataqueMs: number) {
        let picos: number[] = []
        for (let i = 0; i < notas.length / 3; i++) picos.push(pico)
        anadirMelodia(formaOnda, notas, picos, ataqueMs)
    }
    // La firma del estudio: tres acordes de re mayor que suben, cada uno en una posición distinta (re fa# la, fa# la
    // re, la re fa#). Cada búfer es una voz que pasa de un acorde a otro tocando una nota de cada uno; las tres
    // voces suenan juntas.
    function construirAcordeEstudio(inicioHz: number,medioHz: number,finHz: number,pico: number): Buffer {
        let datos=control.createBuffer(84)
        escribirSegmento(datos,0,3,120,inicioHz,inicioHz,0,pico)
        escribirSegmento(datos,12,3,530,inicioHz,inicioHz,pico,0)
        escribirSegmento(datos,24,3,120,medioHz,medioHz,0,pico)
        escribirSegmento(datos,36,3,530,medioHz,medioHz,pico,0)
        escribirSegmento(datos,48,3,220,finHz,finHz,0,pico)
        escribirSegmento(datos,60,3,1580,finHz,finHz,pico,0)
        return datos
    }
    // Cada evento lleva su propia duración: notas largas sobre motivos ligeros que se repiten. Una pequeña desviación
    // lenta del tono mantiene vivos los sonidos largos. entradaMs alarga el ataque de la primera nota (la música
    // empieza después de un silencio).
    function construirVoz(notas: number[], duracionesCorcheas: number[], formaOnda: number,
        volumen: number, esPulsada: boolean, entradaMs: number): Buffer {
        let datos=control.createBuffer((notas.length*4+1)*12)
        let sumaCorcheas=0
        for(let i=0;i<notas.length;i++) {
            // Se redondean los límites acumulados, no las notas sueltas: así el tempo no se desvía.
            let fin=Math.round((sumaCorcheas+duracionesCorcheas[i])*corcheaMs)
            let hz=Math.max(1,notas[i]), duracionMs=fin-Math.round(sumaCorcheas*corcheaMs), desplazamiento=i*48
            sumaCorcheas+=duracionesCorcheas[i]
            let pico=notas[i]==0 ? 0 : Math.floor(volumen*(i%3==0 ? 1 : 0.84))
            let ataqueMs=esPulsada ? 12 : 32
            let caidaMs=esPulsada ? 62 : Math.min(120,Math.floor(duracionMs/3))
            let silencioMs=esPulsada ? 28 : 24
            if(i==0 && entradaMs>ataqueMs) ataqueMs=Math.min(entradaMs,duracionMs-caidaMs-silencioMs-1)
            let aguanteMs=duracionMs-ataqueMs-caidaMs-silencioMs
            escribirSegmento(datos,desplazamiento,formaOnda,ataqueMs,hz,hz,0,pico)
            escribirSegmento(datos,desplazamiento+12,formaOnda,aguanteMs,hz,hz+1,pico,Math.floor(pico*0.72))
            escribirSegmento(datos,desplazamiento+24,formaOnda,caidaMs,hz+1,hz,Math.floor(pico*0.72),0)
            escribirSegmento(datos,desplazamiento+36,formaOnda,silencioMs,hz,hz,0,0)
        }
        return datos
    }
    function construirPercusion(parte: number, numeroCorcheas: number): Buffer {
        let datos=control.createBuffer((numeroCorcheas*3+1)*12)
        for(let i=0;i<numeroCorcheas;i++) {
            // Un bombo ligero, un contratiempo suave y tics discretos; sin redobles antes de los cortes. La parte 5
            // solo hace tics.
            let soloTics=parte==5
            // En la parte 0, las cuatro primeras corcheas no tienen bombo: la música entra poco a poco.
            let bombo=!soloTics && !(parte==0 && i<4) && (i%8==0 || i%8==3 || i%8==6)
            let tambor=!soloTics && (i%8==2 || i%8==7)
            let volumen=bombo ? 378 : tambor ? 189 : soloTics ? 45 : 59
            if(parte==0) volumen=Math.floor(volumen*(i%2!=0 ? 0.4 : 0.6))
            if(parte==4) volumen=Math.floor(volumen*0.75)
            if(parte==7 || parte==8) volumen=Math.floor(volumen*0.65)
            let formaOnda=bombo ? 3 : 18, hz=bombo ? 160 : tambor ? 900 : 1800
            let finHz=bombo ? 48 : 200, desplazamiento=i*36
            escribirSegmento(datos,desplazamiento,formaOnda,8,hz,hz,0,volumen)
            let decaimientoMs=bombo ? 118 : tambor ? 88 : 42
            let duracionMs=Math.round((i+1)*corcheaMs)-Math.round(i*corcheaMs)
            escribirSegmento(datos,desplazamiento+12,formaOnda,decaimientoMs,hz,finHz,volumen,0)
            escribirSegmento(datos,desplazamiento+24,formaOnda,duracionMs-8-decaimientoMs,finHz,finHz,0,0)
        }
        return datos
    }
    function componer() {
        vocesMusica=[]
        // Tonalidad de re mayor. Fundamentales de los acordes, parte por parte: re re sol la re si sol la re la re.
        const fundamentales=[147,147,196,220,147,247,196,220,147,220,147]
        const terceras=[185,185,247,277,185,294,247,277,185,277,185]
        const quintas=[220,220,294,330,220,370,294,330,220,330,220]
        for(let parte=0;parte<momentosMusicaMs.length;parte++) {
            let fundamental=fundamentales[parte], tercera=terceras[parte], quinta=quintas[parte]
            let numeroCorcheas=Math.round(duracionesMusicaMs[parte]/corcheaMs)
            let bajo: number[]=[], duracionesBajo: number[]=[], arpegio: number[]=[], tics: number[]=[]
            for(let i=0;i<numeroCorcheas;i++) {
                // Arpegio sobre la fundamental, la tercera y la quinta (para re, es el motivo de Brummi).
                arpegio.push(parte==0 && i%2!=0 ? 0 : [fundamental*2,tercera*2,quinta*2,tercera*2][i%4])
                tics.push(1)
            }
            // Un bajo saltarín sobre la fundamental y la quinta mantiene el pulso ligero.
            for(let i=0;i<numeroCorcheas/6;i++) {
                bajo.push(fundamental); bajo.push(fundamental); bajo.push(quinta); bajo.push(fundamental)
                duracionesBajo.push(2); duracionesBajo.push(1); duracionesBajo.push(1); duracionesBajo.push(2)
            }
            // Pequeños arcos hacia arriba y hacia abajo; la parte 5 retoma el motivo de Brummi: re, fa#, la, fa#.
            let solista=[294,370,440,370,494,440,370,330]
            let duracionesNotas=[3,1,2,3,1,2,3,3]
            if(parte==0) { solista=[294,0,370,0,440,0]; duracionesNotas=[3,3,3,3,3,3] }
            if(parte==2) solista=[494,587,494,440,370,440,494,440]
            if(parte==3) solista=[440,494,440,330,370,330,440,494]
            if(parte==4) { solista=[370,330,294,0,330,294]; duracionesNotas=[3,3,3,3,3,3] }
            if(parte==5) { solista=[294,370,440,370,294,370,440,370]; duracionesNotas=[2,2,2,3,2,2,2,3] }
            if(parte==6) solista=[494,587,659,587,494,440,494,587]
            if(parte==7) solista=[440,494,659,494,440,370,330,440]
            if(parte==8) solista=[587,494,440,370,440,494,587,440]
            if(parte==9) solista=[659,587,494,440,494,587,659,740]
            if(parte==10) { solista=[370,440,587]; duracionesNotas=[2,2,14] }
            if(parte!=10) {
                let cantidad=solista.length
                for(let i=0;i<cantidad;i++) { solista.push(solista[i]); duracionesNotas.push(duracionesNotas[i]) }
            }
            let parteEstudio=parte==7 || parte==8, primero=parte==0,
                parteBrummi=parte==5, entradaMs=primero ? 400 : 0
            vocesMusica.push(construirVoz(bajo,duracionesBajo,3,
                primero ? 200 : parteEstudio ? 290 : 380,true,entradaMs))
            vocesMusica.push(construirVoz([tercera,quinta,tercera],
                [numeroCorcheas/3,numeroCorcheas/3,numeroCorcheas/3],1,
                parteBrummi ? 0 : primero ? 200 : parteEstudio ? 180 : 260,false,entradaMs))
            vocesMusica.push(construirVoz(solista,duracionesNotas,1,
                primero ? 240 : parteEstudio ? 300 : parte>=9 ? 400 : 360,false,entradaMs))
            vocesMusica.push(construirVoz(arpegio,tics,1,
                parteBrummi ? 0 : primero ? 110 : parteEstudio ? 140 : 210,true,entradaMs))
            vocesMusica.push(construirPercusion(parte,numeroCorcheas))
        }
    }
    // Una frase de notas seno iguales (0 = silencio): el zumbido de Brummi (su motivo re, fa#, la, fa#) y las gotas del
    // ambiente de la mina. Los silencios son segmentos explícitos de volumen cero; ningún temporizador ni ninguna nota
    // en espera sobrevive a un salto.
    function construirMotivo(notas: number[], duracionMs: number, volumen: number): Buffer {
        let datos = control.createBuffer((notas.length * 3 + 1) * 12)
        let duracionNotaMs = Math.floor(duracionMs / notas.length)
        for (let i = 0; i < notas.length; i++) {
            let desplazamiento = i * 36, nota = notas[i]
            let pico = nota == 0 ? 0 : volumen
            escribirSegmento(datos, desplazamiento, 3, 110, Math.max(1,nota), Math.max(1,nota), 0, pico)
            escribirSegmento(datos, desplazamiento + 12, 3, duracionNotaMs - 210,
                Math.max(1,nota), Math.max(1,nota), pico, 0)
            escribirSegmento(datos, desplazamiento + 24, 3, 100, 1, 1, 0, 0)
        }
        return datos
    }
    function tocarAmbiente(ahoraMs: number) {
        // La práctica conserva sus sonidos de acción claros y aislados, sin ambiente. En el
        // ascensor: silencio tranquilo.
        if (Noche.estado != Noche.Estado.Partida || Noche.sala == 0 || Noche.taquillaEscondida >= 0) return
        if (ahoraMs < ocupadoHastaMs && prioridad >= 2) return
        if (ahoraMs >= proximoAmbienteMs) {
            let tipoSala = Noche.salas[Noche.sala].tipo
            let numero = (tipoSala + numeroAmbiente++) % ambientes.length
            music.playInstructions(0, ambientes[numero])
            proximoAmbienteMs = ahoraMs + 7200 + (tipoSala % 3) * 900
        }
        // Brummi tararea su motivo cuando está cerca; más deprisa cuando sigue al personaje.
        if (Noche.distanciaPitido <= 12 && Noche.brummi.comportamiento != Noche.Comportamiento.EstacionCarga
            && ahoraMs >= proximoZumbidoMs) {
            let siguiendo = Noche.brummi.comportamiento == Noche.Comportamiento.Seguir
            music.playInstructions(0, zumbido[siguiendo ? 1 : 0])
            proximoZumbidoMs = ahoraMs + (siguiendo ? 2100 : 4200)
        }
    }
    export function preparar() {
        sonidos = []; duracionesMs = []
        anadirSonido(18, 90, 60, 0, 8, 24)         // 0: sin usar
        anadirSonido(18, 700, 240, 260, 15, 100)   // 1: interruptor suave
        anadirTonada(1, [988,988,60, 1319,1319,90], 240, 8) // 2: recoger, un «ploc» claro
        anadirSonido(18, 600, 160, 280, 20, 190)   // 3: pestillo / trabajo del generador
        anadirTonada(3, [1400,1900,180, 1700,1700,120], 300, 20) // 4: silbato, dos tonos, sin ruido
        // 5: Brummi empieza a seguir al personaje (tres tonos que suben)
        anadirTonada(1, [587,587,80, 740,740,80, 880,880,140], 260, 10)
        anadirTonada(1, [392,392,240, 330,330,240, 262,262,420], 300, 50) // 6: fin de la noche, suave y descendente
        anadirTonada(1, [880,880,70, 0,0,60, 1175,1175,90], 220, 8) // 7: Brummi se despierta (pi pi)
        // 8: un silbato que llega a Brummi: los mismos dos tonos que el 4 y después su trino (reglas.ts manda 8 en
        // lugar de 4 en el mismo cuadro, para que el silbato se siga oyendo).
        anadirMelodia(3, [1400,1900,180, 1700,1700,120, 0,0,80,
            1175,1175,50, 1319,1319,50, 1175,1175,50, 1319,1319,50, 1175,1175,50, 1480,1480,90],
            [300,300,0,200,200,200,200,200,200], 20)
        // 9: noche superada, re mayor que sube
        anadirTonada(1, [587,587,130, 740,740,130, 880,880,130, 1175,1175,700], 300, 15)
        // 10: libre (nunca se manda; el número se queda para que los demás conserven el suyo)
        sonidos.push(sonidos[0]); duracionesMs.push(0)
        anadirSonido(18, 360, 100, 150, 12, 100)   // 11: paso amortiguado
        anadirSonido(18, 800, 180, 340, 20, 220)   // 12: el fusible encaja con un clic
        anadirSonido(1, 880, 1175, 170, 10, 90)    // 13: pitido (Brummi está cerca)
        anadirTonada(3, [1320,880,70, 0,0,120, 990,660,70], 110, 6) // 14: gotas de agua
        anadirSonido(18, 320, 180, 110, 350, 1500) // 15: viento de fuera
        anadirSonido(18, 240, 120, 160, 250, 1400) // 16: movimiento de la cabina
        anadirSonido(18, 440, 110, 200, 20, 260)   // 17: chispas sueltas
        anadirSonido(1, 294, 440, 260, 500, 1600)  // 18: oleada del título y después silencio
        anadirSonido(1, 523, 262, 200, 80, 650)    // 19: apagado suave en la intro
        anadirSonido(18, 300, 120, 95, 12, 90)     // 20: andar, más suave que correr
        anadirTonada(1, [659,659,90, 880,880,130], 240, 10) // 21: práctica lista
        anadirSonido(3, 523, 1047, 300, 140, 520)  // 22: el monitor se enciende, suave
        anadirSonido(1, 294, 587, 240, 600, 1050)  // 23: oleada del estudio
        sonidos.push(construirAcordeEstudio(294,370,440,480));duracionesMs.push(3100) // 24: firma
        anadirTonada(1, [880,880,80, 1175,1175,80, 880,880,160], 260, 10) // 25: Brummi toma un fusible
        anadirTonada(1, [784,659,140], 160, 10)    // 26: Brummi no encuentra nada
        anadirTonada(1, [784,784,90, 0,0,70, 784,784,110], 220, 10) // 27: la lámpara se debilita (tono doble)
        anadirTonada(1, [1175,1175,80, 880,880,140], 200, 10) // 28: Brummi devuelve el fusible
        anadirTonada(3, [1760,1760,450, 2637,2637,650], 220, 5) // 29: campanita (intro)
        // 30: pitidos que suben (intro)
        anadirTonada(1, [880,880,80, 0,0,60, 1175,1175,80, 0,0,60, 1480,1480,140], 200, 8)
        acordeGrave=construirAcordeEstudio(370,440,587,400)
        acordeAgudo=construirAcordeEstudio(440,587,740,340)
        ocupadoHastaMs = 0; prioridad = 0; estadoAnterior = -1; edadAnteriorMs = -1
        numeroSonidoIntro = 0; numeroMusica = 0; silenciado = false; vocesMusica=[]
        proximoAmbienteMs=0; proximoZumbidoMs=0; numeroAmbiente=0
        // Un zumbido suave, gotas agudas, aire ligero, un segundo patrón de gotas; nada por debajo de 100 Hz.
        ambientes = [construirEnvolvente(3,220,220,80,900,2600),
            construirMotivo([1175,0,880,0],2400,100),
            construirEnvolvente(18,420,260,90,1000,3000),
            construirMotivo([988,0,0,740],2800,90)]
        zumbido = [construirMotivo([587,740,880,740],1600,120),
            construirMotivo([587,740,880,740],1200,150)]
        pisadaAgua=construirEnvolvente(18,820,170,130,18,160)
        pisadaMetal=construirEnvolvente(18,1200,220,155,12,130)
        pisadaAguaCorriendo=construirEnvolvente(18,980,140,190,18,190)
        pisadaMetalCorriendo=construirEnvolvente(18,1400,180,220,12,160)
        componer()
    }

    function parar() {
        music.stopAllSounds()
        ocupadoHastaMs = 0; prioridad = 0
    }
    function reproducir(numero: number, nuevaPrioridad: number, ahoraMs: number) {
        if (numero <= 0 || numero >= sonidos.length) return
        // Los sonidos de primer plano interrumpen enseguida a los efectos menos importantes; nunca se ponen en cola.
        if (ahoraMs < ocupadoHastaMs && nuevaPrioridad <= prioridad) return
        if (ahoraMs < ocupadoHastaMs) parar()
        let bufer=sonidos[numero]
        if ((numero==11 || numero==20) && Noche.salas.length>0) {
            let suelo=Noche.baldosa(Noche.sala,Math.floor(Noche.personajeX/8),Math.floor(Noche.personajeY/8))
            if(suelo==3) bufer=numero==11 ? pisadaAguaCorriendo : pisadaAgua
            if(suelo==2) bufer=numero==11 ? pisadaMetalCorriendo : pisadaMetal
        }
        music.playInstructions(0, bufer)
        if(numero==24) {
            music.playInstructions(0,acordeGrave)
            music.playInstructions(0,acordeAgudo)
        }
        ocupadoHastaMs = ahoraMs + ((numero==11 || numero==20) ? 190 : duracionesMs[numero]); prioridad = nuevaPrioridad
    }
    export function actualizar(ahoraMs: number) {
        let ultimaEdadMs = edadAnteriorMs
        let haCambiadoEstado = estadoAnterior != Noche.estado || Noche.edadMs < ultimaEdadMs
        estadoAnterior = Noche.estado; edadAnteriorMs = Noche.edadMs
        if (haCambiadoEstado) {
            parar()
            numeroSonidoIntro = 0
            numeroMusica = 0
            proximoAmbienteMs=ahoraMs+1200
            proximoZumbidoMs=ahoraMs+600
        }
        // Un salto dentro de la intro (hacia la tarjeta) corta una vez la música en curso; después la tarjeta toca
        // sus propios sonidos.
        else if (Noche.estado == Noche.Estado.Intro && Noche.edadMs - ultimaEdadMs > 1000) parar()
        if (Noche.mudo || Noche.estado == Noche.Estado.Pausa) {
            if (!silenciado) parar()
            silenciado = true; Noche.numeroEfecto = 0
            return
        }
        if (silenciado) { silenciado = false; Noche.numeroEfecto = 0 }
        if (Noche.estado == Noche.Estado.Intro) {
            Noche.numeroEfecto = 0
            while(numeroMusica<momentosMusicaMs.length && Noche.edadMs>=momentosMusicaMs[numeroMusica]) {
                let numeroParte=numeroMusica++
                if(Noche.edadMs-momentosMusicaMs[numeroParte]<150) {
                    for(let voz=0;voz<5;voz++) music.playInstructions(0,vocesMusica[numeroParte*5+voz])
                }
            }
            // Si el tiempo salta, se tiran los sonidos antiguos en vez de volver a tocarlos todos de golpe.
            while (numeroSonidoIntro < momentosSonidosMs.length
                && Noche.edadMs >= Noche.tiempoRealIntroMs(momentosSonidosMs[numeroSonidoIntro])) {
                let numeroSonido = numeroSonidoIntro++
                if (Noche.edadMs - Noche.tiempoRealIntroMs(momentosSonidosMs[numeroSonido]) < 150)
                    reproducir(numerosSonidos[numeroSonido], 1, ahoraMs)
            }
            return
        }
        if (Noche.numeroEfecto > 0) {
            let numeroSonido = Noche.numeroEfecto, nuevaPrioridad = Noche.prioridadEfecto
            Noche.numeroEfecto = 0
            reproducir(numeroSonido, nuevaPrioridad, ahoraMs)
        }
        tocarAmbiente(ahoraMs)
    }
}
