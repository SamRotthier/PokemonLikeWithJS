// Global Variables
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d') 
canvas.width = 1024
canvas.height = 576
const battle = {
    initiated : false
}
const keys = {
    z: {pressed: false},
    s: {pressed: false},
    q: {pressed: false},
    d: {pressed: false}
}

const encounterChance = 0.01
const playerMovementSpeed = 3


//----------------------------------------------------------------------------//

// Loading the map
    // Loading Collisionzones from file
const collisionsMap=[]
for (let i = 0; i< collisions.length; i+=70){
 collisionsMap.push(collisions.slice(i,70 +i))
}

    // Loading Battlezones from file
const battleZonesMap=[]
for (let i = 0; i< battleZonesData.length; i+=70){
    battleZonesMap.push(battleZonesData.slice(i,70 +i))
}

    // Building the collisions on the map
const boundaries = []
const offset ={x: -735, y:-650}
collisionsMap.forEach((row, i) =>{
    row.forEach((symbol, j)=>{
        if(symbol === 1025) //1025 is a red block in the Tiled map editor
        boundaries.push(
            new Boundary({
            position: {
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y
            }
        })
        )
    })
})

    // Building the battlezones on the map
const battleZones = []
battleZonesMap.forEach((row, i) =>{
    row.forEach((symbol, j)=>{
        if(symbol === 1025) //1025 is a red block in the Tiled map editor
        battleZones.push(
            new Boundary({
            position: {
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y
            }
        })
        )
    })
})

//----------------------------------------------------------------------------//

// Making an object for the player
const playerDownImage = new Image()
playerDownImage.src = './img/playerDown.png'
const playerUpImage = new Image()
playerUpImage.src = './img/playerUp.png'
const playerLeftImage = new Image()
playerLeftImage.src = './img/playerLeft.png'
const playerRightImage = new Image()
playerRightImage.src = './img/playerRight.png'
const player = new Sprite({
    position: {
        x: canvas.width/2 - 192 /4/2,
        y: canvas.height /2 - 68 /2
    },
    image: playerDownImage,
    frames: {
        max : 4,
        hold: 10
    },
    sprites: {
       up:  playerUpImage,
       down:  playerDownImage,
       left:  playerLeftImage,
       right:  playerRightImage
    }
})

// making an object the background sprites (map where you walk on)
const background = new Sprite({
    position: {
    x: offset.x,
    y:offset.y
    },
    image:{
        src:'./img/Pellet Town.png'
    } 
})

// making an object the foreground sprites (where you can walk behinde)
const foreground = new Sprite({
    position: {
    x: offset.x + 432,
    y:offset.y + 147
    },
    image:{
        src:'./img/foreground.png'
    } 
})

// Loaded objects in an array
const movables = [ background, ...boundaries, foreground, ...battleZones]

//----------------------------------------------------------------------------//

// Collision detection (example: rectangle1 = Player ; rectangle2 = collisionBox)
function rectengularCollision({rectengle1, rectengle2}){
    return(
        rectengle1.position.x + rectengle1.width >= rectengle2.position.x &&
        rectengle1.position.x <= rectengle2.position.x +rectengle2.width &&
        rectengle1.position.y <= rectengle2.position.y + rectengle2.height &&
        rectengle1.position.y + rectengle1.height >= rectengle2.position.y 
    )
}

//----------------------------------------------------------------------------//

// This is the animation loop
function animate(){
    const animationId = window.requestAnimationFrame(animate) // Gets the animation Id so we can stop it later in the code
    //Drawing the different sprites on screen
    background.draw()
    boundaries.forEach(boundary=>{boundary.draw()})
    battleZones.forEach(battleZone => {battleZone.draw()});
    player.draw()
    foreground.draw()

    let moving = true;
    player.animate = false

    if (battle.initiated) return

    //activate a battle
    if(keys.z.pressed || keys.q.pressed || keys.d.pressed || keys.s.pressed){
        for (let i = 0; i <battleZones.length; i++){
            const battleZone = battleZones [i]
            //Calculating how far the player (surface area of the sprite) is on the grass
            const overlappingarea = 
            (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) -
             Math.max(player.position.x, battleZone.position.x)) * 
            (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) -
             Math.max(player.position.y, battleZone.position.y))

            if (rectengularCollision({rectengle1: player , rectengle2 : battleZone}) 
                && overlappingarea > (player.width * player.height) /2 && Math.random() < encounterChance
                ){ 
                window.cancelAnimationFrame(animationId) //Deactivate old animation loop
                audio.map.stop()
                audio.initBattle.play()
                audio.battle.play()
                battle.initiated = true
                gsap.to('#overlappingDiv', {
                    opacity:1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete(){
                        gsap.to('#overlappingDiv', {
                            opacity:1,
                            duration: 0.4,
                            onComplete(){
                            initBattle()
                            animateBattle() // activate new animation loop for the battle
                            gsap.to('#overlappingDiv', {
                                opacity: 0,
                                duration: 0.4
                            })}
                        })
                    }
                })
            break
            }
        }
    }

    // Player movements with zsqd keys
    if (keys.z.pressed && lastKey === 'z') {
        player.animate = true
        player.image = player.sprites.up
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries [i]
            if (rectengularCollision({rectengle1: player, rectengle2 : {...boundary, 
                position: {
                    x: boundary.position.x,
                    y: boundary.position.y + playerMovementSpeed // Checking 3 pixels in the future
            }}})){
                moving = false
                break
            }
        }
        if (moving) movables.forEach (movable => {movable.position.y += playerMovementSpeed})
    }
    else if (keys.s.pressed && lastKey === 's') {
        player.animate = true
        player.image = player.sprites.down
        for (let i = 0; i <boundaries.length; i++){
            const boundary = boundaries [i]
            if (rectengularCollision({rectengle1: player , 
                rectengle2 : {...boundary, position: {
                x: boundary.position.x,
                y: boundary.position.y - playerMovementSpeed // Checking 3 pixels in the future
            }}})){
                moving = false
                break
            }
        }
        if (moving) movables.forEach (movable => {movable.position.y -= playerMovementSpeed})
    }
    else if  (keys.q.pressed && lastKey === 'q') {
        player.animate = true
        player.image = player.sprites.left
        for (let i = 0; i <boundaries.length; i++){
            const boundary = boundaries [i]
            if (rectengularCollision({rectengle1: player , 
                rectengle2 : {...boundary, position: {
                x: boundary.position.x + playerMovementSpeed, // Checking 3 pixels in the future
                y: boundary.position.y
            }}})){
                moving = false
                break
            }
        }
        if (moving) movables.forEach (movable => {movable.position.x += playerMovementSpeed})
    }
    else if  (keys.d.pressed && lastKey === 'd') {
        player.animate = true
        player.image = player.sprites.right
        for (let i = 0; i <boundaries.length; i++){
            const boundary = boundaries [i]
            if (rectengularCollision({rectengle1: player , 
             rectengle2 : {...boundary, position: {
             x: boundary.position.x- playerMovementSpeed, // Checking 3 pixels in the future
             y: boundary.position.y
            }}})){
                moving = false
                break
            }
     }
        if (moving) movables.forEach (movable => {movable.position.x -= playerMovementSpeed})
    }
}
animate() // starts the animation loop for the game

//----------------------------------------------------------------------------//
// Part of the player movement
    //Checks what the last pressed key was
let lastKey =''
window.addEventListener('keydown', (e)=>{
switch(e.key){
    case 'z':
        keys.z.pressed = true
        lastKey ='z'
        break
    case 'q':
        keys.q.pressed = true
        lastKey ='q'
        break
    case 'd':
        keys.d.pressed = true
        lastKey ='d'
        break
    case 's':
        keys.s.pressed = true
        lastKey ='s'
        break
}
})    

    //Checks if the key is let go
window.addEventListener('keyup', (e)=>{
    switch(e.key){
        case 'z':
            keys.z.pressed = false
            break
        case 'q':
            keys.q.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
    }
    })     

//----------------------------------------------------------------------------//

// Listens to a click on the screen before starting the music
// This is needed otherwise warnings
let clicked = false
addEventListener('click',()=>{
    if (!clicked){
        audio.map.play()
        clicked = true
    } 
})


    //Buggs in opacity (moves and faint)