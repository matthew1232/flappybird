const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const waitSeconds = 3;

const GAME_SPEED = 1.7;
const PIPE_Y_DIFFERENCE = 135;
const PIPE_X_DIFFERENCE = 140;
const TO_RADIANS = Math.PI/180; 

const imagePaths = {
    bird: './images/bird.png',
    topPipe: './images/topPipe.png',
    bottomPipe: './images/bottomPipe.png',
    background: './images/background.png',
    ground: './images/ground.png'
};

const audioPaths = {
    fly: './audio/fly.mp3',
    score: './audio/score.mp3'
};

function mobileAndTabletcheck() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

const scoreAudio = new Audio();
scoreAudio.src = audioPaths.score;

const flyAudio = new Audio();
flyAudio.src = audioPaths.fly;

class Bird {
    constructor(){
        this.x = 50;
        this.y = 150;
        this.width = 38;
        this.height = 25;

        this.angle = 0;
        this.gravity = 0.27;
        this.gravitySpeed = 0;

        this.isDying = false;
        this.dyingFrameCount = 0;
        this.AODFrameCount = 60;

        this.isJumping = false;
        this.jumpSpeed = 15; // (frames)
        this.jumpFrameCount = 0;
        this.jumpAngleFrameAmount = 3;
        this.jumpAngle = -35;

        this.image = new Image();
        this.image.src = imagePaths.bird;
    }

    reset(){
        this.x = 50;
        this.y = 150;
        this.angle = 0;
        this.gravity = 0.27;
        this.gravitySpeed = 0;
        this.isDying = false;
        this.dyingFrameCount = 0;
        this.isJumping = false;
        this.jumpFrameAmount = 3;
    }

    isHittingGround(){
        if (this.y >= canvas.height - 115 - this.height){
            return true;
        }
        else return false;
    }

    isHittingPipe(pipe){
        if (this.y >= pipe.topY - pipe.topPipeH - bird.height / 2 && this.y <= pipe.topY + pipe.topPipeH + bird.height / 2 && this.x >= pipe.x - bird.width / 3 && this.x <= pipe.x + pipe.width){
            console.log('HITTING TOP PIPE!!!!');
            return true;
        };

        if (this.y >= pipe.bottomY - bird.height / 2 && this.x >= pipe.x - bird.width / 3 && this.x <= pipe.x + pipe.width){
            console.log('HITTING BOTTOM PIPE!!!!!!!')
            return true;
        }

        return false;
    }

    bounce(){
        if (this.isDying) return;

        this.isJumping = true;
        this.jumpFrameCount = 0;
        this.gravitySpeed = 0;

        flyAudio.play();
    }

    die(recursing){
        if (this.isDying && !recursing){
            return;
        };

        if (!recursing){
            this.isDying = true;
            this.gravitySpeed = 0;
        };

        if (this.angle > 0){
            this.angle-=10;
        };

        this.y += 3;
    }

    update(){
        if (this.angle === 360){
            this.angle = 0;
        };

        if (this.isDying){
            if (this.angle < 90){
                this.angle += 16;
            };


            if (this.angle > 90){
                this.angle -= 16;
            };

            this.gravitySpeed += this.gravity;
            this.y += this.gravitySpeed;
        };

        if (!this.isDying && this.angle < 90){
            this.angle += this.gravitySpeed / 2;
        };

        if (!this.isJumping && !this.isDying){
            this.gravitySpeed += this.gravity;
            this.y += this.gravitySpeed;
        };

        if (this.isJumping){
            if (this.jumpFrameCount === this.jumpSpeed){
                this.isJumping = false;
                this.gravitySpeed = this.gravity;
            };

            if (this.angle > this.jumpAngle){
                console.log(Math.abs(this.jumpAngle));

                this.angle -= Math.abs(this.jumpAngle) / this.jumpAngleFrameAmount;
            };

            this.y -= (this.jumpSpeed - this.jumpFrameCount) / 1.85;
            this.jumpFrameCount++;
        }
    }

    draw(){
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * TO_RADIANS);
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.rotate(-this.angle * TO_RADIANS);
        ctx.translate(-this.x, -this.y);
    }
}

class Background {
    constructor(){
        this.image = new Image();
        this.image.src = imagePaths.background;
    }

    draw(){
        ctx.drawImage(this.image, 0, 0);
    }
}

class FlashBang {
    constructor(){
        this.length = 2600;
        this.opacity = 1;
        this.completedFadeOut = false;
        this.completedFadeIn = false;
    }

    reset(){
        this.opacity = 1;
        this.completedFadeOut = false;
        this.completedFadeIn = false;
    }

    fadeIn(){
        if (this.opacity >= 1 || this.completedFadeIn) return;

        this.opacity += (100 / this.length);

        if (this.opacity >= 0){
            this.completedFadeIn = true;
        };
    }

    fadeOut(){
        if (this.opacity <= 0 || this.completedFadeOut) return true;

        this.opacity -= (100 / this.length);

        if (this.opacity <= 0){
            this.completedFadeOut = true;
        };

        return false;
    }

    draw(){
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

class Ground {
    constructor(){
        this.image = new Image();
        this.image.src = imagePaths.ground;

        this.firstXpos = 0;
        this.secondXpos = canvas.width - 5;
    }

    move(){
        this.firstXpos -= GAME_SPEED;
        this.secondXpos -= GAME_SPEED;

        if (this.firstXpos <= -canvas.width){
            this.firstXpos = canvas.width;
        };

        if (this.secondXpos <= -canvas.width){
            this.secondXpos = canvas.width;
        };
    }

    draw(){
        ctx.drawImage(this.image, this.firstXpos, canvas.height - 115);
        ctx.drawImage(this.image, this.secondXpos, canvas.height - 115);
    }
};

const topPipeImage = new Image();
const bottomPipeImage = new Image();

topPipeImage.src = imagePaths.topPipe;
bottomPipeImage.src = imagePaths.bottomPipe;

class Pipe {
    constructor(){
        this.x = canvas.width;
        this.topY;
        this.bottomY;
        this.width = 52;
        this.ySpeed = 0.5;
        this.hasPassed = false;
        this.movingUpAndDown = false;
        this.movingUpFrameAmount;
        this.movingDownFrameAmount;
        this.movingUpFrameCount;
        this.movingDownFrameCount;
        this.movingUpFirst;

        this.topPipeH = 242;
        this.bottomPipeH = 378;
    }

    moveUpAndDown(){
        this.movingUpAndDown = true;
        this.movingUpFrameAmount = 120;
        this.movingDownFrameAmount = 120;
        this.movingUp = Math.round(Math.random()) === 1 ? true : false; 
        this.movingUpFrameCount = 0;
        this.movingDownFrameCount = 0;
    
        console.log(this.topY);
        console.log(this.topPipeH);
        console.log(this.topY - this.movingUpFrameAmount <= -this.topPipeH)
        console.log(this.topY - this.topPipeH + this.movingUpFrameAmount)
        console.log(this.topY - this.topPipeH + this.movingUpFrameAmount >= 0);

        if (this.topY - this.movingUpFrameAmount >= -this.topPipeH){
            this.movingUpAndDown = false;
        };
    }

    update(){
        this.x -= GAME_SPEED;

        if (this.movingUpAndDown){
            if (this.movingUp && this.movingUpFrameCount < this.movingUpFrameAmount){
                this.movingUpFrameCount++;

                this.topY -= this.ySpeed;
                this.bottomY -= this.ySpeed;

                if (this.movingUpFrameCount === this.movingUpFrameAmount){
                    this.movingUp = false;
                    this.movingDownFrameCount = 0;
                };
            };

            if (!this.movingUp && this.movingDownFrameCount < this.movingDownFrameAmount){
                this.movingDownFrameCount++;

                this.topY += this.ySpeed;
                this.bottomY += this.ySpeed;

                if (this.movingDownFrameCount === this.movingDownFrameAmount){
                    this.movingUp = true;
                    this.movingUpFrameCount = 0;
                };
            };
        };
    }

    pickRandomLocation(){
        this.topY = Math.floor(Math.random() * this.topPipeH) - this.topPipeH;
        this.bottomY = this.topY + this.topPipeH + PIPE_Y_DIFFERENCE; 
    }

    draw(){
        ctx.drawImage(topPipeImage, this.x, this.topY);
        ctx.drawImage(bottomPipeImage, this.x, this.bottomY);
    }
}

class Score {
    constructor(){
        this.x = canvas.width / 2;
        this.y = canvas.height / 4;
        this.score = 0;
        this.highScore = 0;
    }

    draw(){
        ctx.fillStyle = "white";
        ctx.font = '70px "8bit"';
        ctx.textAlign = "center";
        ctx.fillText(this.score.toString(), this.x, this.y);

        ctx.fillStyle = "yellow";
        ctx.font = '15px "8bit"';
        ctx.fillText('High score: ' + this.highScore.toString(), canvas.width - 80, 20);
    };
};

const randomPipeEvents = ["moveUpAndDown", "multiples"];
let randomPipeEventChance = 40; //Each event has a 1/40 chance

const bird = new Bird();
const background = new Background();
const ground = new Ground();
const score = new Score();
const flashBang = new FlashBang();

const pipe = new Pipe();
pipe.pickRandomLocation();

let gameEnded = true;
let gameEnding = false;
let fadedOutTimestamp = new Date().getTime();
let isFadingIn = false;

let pipes = [pipe];

function resetGame(){
    const pipe = new Pipe();
    pipe.pickRandomLocation();

    pipes = [pipe];

    bird.reset();
};

function endGame(){
    bird.die();
    flashBang.reset();

    gameEnding = true;
    randomPipeEventChance = 60;
};

function gameLoop(){    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    background.draw();

    const randomPipeEventNumber = Math.floor(Math.random() * randomPipeEventChance);

    for (let i = 0; i < pipes.length; i++){
        const pipe = pipes[i];

        if (pipe.x <= 0 - 50 && pipes[i + 1].x <= 0 - 50){
            pipes.shift();
        };

        if (!gameEnding && !gameEnded){
            pipe.update();
        };

        pipe.draw();

        if (!gameEnding && bird.isHittingPipe(pipe)){
            console.log('Bird hit pipe, ending game.');

            endGame();
        };

        if (pipe.x + pipe.width <= bird.x && !pipe.hasPassed){
            pipe.hasPassed = true;
            score.score++;

            //Every other score, if the randomPipeEventChance is higher than 10 it subtracts it by the log of the score.
            if (randomPipeEventChance >= 10 && score.score % 2 === 0){
                randomPipeEventChance -= Math.log(score.score);
                console.log('Random chance: ' + randomPipeEventChance);
            };

            if (score.score > score.highScore){
                score.highScore = score.score;
            };

            scoreAudio.play();
        };
    };

    if (!gameEnding){
        ground.move();
    };
    
    ground.draw();

    if (!gameEnded) bird.update();

    const isHittingGround = bird.isHittingGround();

    if (pipes[pipes.length - 1].x <= canvas.width - PIPE_X_DIFFERENCE && !gameEnding && !gameEnded){
        console.log('Loading pipe');

        const pipe = new Pipe();
        pipe.pickRandomLocation();

        pipes.push(pipe);

        if (randomPipeEventNumber <= randomPipeEvents.length - 1){
            switch (randomPipeEvents[randomPipeEventNumber]){
                case 'moveUpAndDown':
                    pipe.moveUpAndDown();
                    break;
                case 'multiples':
                    const startingPipe = new Pipe();
                    startingPipe.pickRandomLocation();
                    startingPipe.x += PIPE_X_DIFFERENCE;

                    pipes.push(startingPipe);

                    for (let i = 0; i < Math.random() * (6 - 3) + 3; i++){
                        const pipe = new Pipe();
                        pipe.x = pipes[pipes.length - 1].x + pipe.width;
                        pipe.topY = startingPipe.topY;
                        pipe.bottomY = startingPipe.bottomY;

                        console.log(pipe);

                        pipes.push(pipe);
                    };  
                    break;
            };
        };
    };

    if (isHittingGround && !gameEnded && !gameEnding){
        console.log('Bird hit the ground. Ending game.');

        endGame();
    };

    bird.draw();
    score.draw();

    if (gameEnding){
        const hasFadedOut = flashBang.fadeOut();

        if (hasFadedOut){
            setTimeout(() => {
                gameEnding = false;
                gameEnded = true;

                resetGame();
            }, 1000);
        };

        flashBang.draw();
    };

    if (gameEnded){
        ctx.fillStyle = "white";
        ctx.font = '23px "8bit"';
        ctx.textAlign = "center";
        ctx.fillText('Press space or', canvas.width / 2, canvas.height / 2);
        ctx.fillText('tap to start', canvas.width / 2, canvas.height / 2 + 20)
    };

    requestAnimationFrame(gameLoop);
};

canvas.addEventListener('touchstart', () => {
    if (mobileAndTabletcheck()){
        if (gameEnded){
            score.score = 0;
            gameEnded = false;
        };

        bird.bounce();
    };
});

canvas.addEventListener('mousedown', () => {
    if (!mobileAndTabletcheck()){
        if (gameEnded){
            score.score = 0;
            gameEnded = false;
        };

        bird.bounce();
    };
});

window.addEventListener('keydown', (e) => {
    if (e.keyCode === 32 || e.keyCode === 38){
        if (gameEnded){
            score.score = 0;
            gameEnded = false;
        };

        bird.bounce();
    };
});

requestAnimationFrame(gameLoop);