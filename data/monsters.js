const embyImage=new Image()
embyImage.src = '../img/embySprite.png'

const dragleImage=new Image()
dragleImage.src = '../img/draggleSprite.png'

const monsters = {
    Emby:{
        position:{
            x:280,
            y:325
        },
        image:{
            src:'../img/embySprite.png'
        } ,
        frames:{
            max: 4,
            hold: 30
        }, 
        animate: true,
        name: 'Emby',
        attacks:[attacks.Tackle, attacks.Fireball]
    },
    Draggle:{
        position:{
            x:800,
            y:100
        },
        image:{
            src:'../img/draggleSprite.png'
        } ,
        frames:{
            max: 4,
            hold: 30
        }, 
        animate: true,
        isEnemy: true,
        name: 'draggle',
        attacks:[attacks.Tackle, attacks.Fireball]
    }

}