// Adaptador del aparato: lee las teclas y le da al juego el tiempo que ha pasado. El sonido usa sonidos del mezclador
// con principio y final suaves, que siempre terminan.
let ultimoCuadroMs = control.millis()
NocheSonido.preparar()
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () { Noche.alternarPausa() })
game.onUpdate(function () {
    let ahoraMs = control.millis()
    let dt = Math.min(50,ahoraMs-ultimoCuadroMs)
    ultimoCuadroMs = ahoraMs
    let teclas = 0
    if (controller.left.isPressed()) teclas |= 1
    if (controller.right.isPressed()) teclas |= 2
    if (controller.up.isPressed()) teclas |= 4
    if (controller.down.isPressed()) teclas |= 8
    if (controller.A.isPressed()) teclas |= 16
    if (controller.B.isPressed()) teclas |= 32
    Noche.actualizar(dt,teclas)
    NocheSonido.actualizar(ahoraMs)
})
game.onPaint(function () { Noche.dibujar() })
