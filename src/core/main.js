         ///////////////////////////////////////////////////////////////////////////////////
        //* ===================================================
       //*  T E R Ä S L I L J A : T H E M O V I E T H E G A M E
      //*   ===================================================
     //*          by Mikko J. Jakonen
    //*
   //*      This is a game meant to be a tie-in for a comic book called Teräslilja
  //*       ja mutanttizombiet. It's a game about shooting mutant zombies.
 //*        This is the main game state file.
//*
(function(){

    Lilja.Main = function() {    };

    Lilja.Main.prototype = {
        
        
          ///////{ Game setup }///////////////////////////////////////////////////////////
         //
        //
        create: function() {
            //---- base setup -------------------------------
            
            this._running = true;
            
            this.fpsCounter = this.add.text(10, 10);
            this.fpsCounter.fontSize = '14px';
            this.fpsCounter.text = '100 FPS';
            this.game.time.advancedTiming = true;
            
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.physics.arcade.gravity.y = 1000;
            
            Lilja.sfx = this.add.audioSprite('sfx');
            
            //---- tilemap setup ---------------------------
            
            this.map = this.add.tilemap('level01');
            this.map.addTilesetImage('tileset', 'tiles');
            this.layerBg = this.map.createLayer('bg');
            this.layerBg.resizeWorld();
            this.layerTerrain = this.map.createLayer('terrain');
            this.map.setCollision(1, true, this.layerTerrain);
            
            //---- setup game objects ------------------ 
            
            this.player = new Lilja.Player(this.game, 112, 300);
            this.camera.follow(this.player);
            
            this.enemies = this.add.group();
            
            this.bullets = this.player.bullets;
            
            for (var i = 0; i < 10; i++) 
                new Lilja.Zombie(this.game, 612 + i * 20, 400, this.player, this.enemies);
            
            //--- dialogue test --------------------
            
            this.dialogue = new Escape.DialogueManager(this.game);
        },
        
          ////////// { Updating } /////////////////////////////////////////////////////////////////
         //
        //
        update: function() {
            if(!this._running) return;
            
            this.game.physics.arcade.collide(this.player, this.layerTerrain);
            this.game.physics.arcade.collide(this.enemies, this.layerTerrain);
            this.game.physics.arcade.collide(this.bullets, this.layerTerrain, this._bulletWallCollision, null, this);
            this.game.physics.arcade.collide(this.bullets, this.enemies, this._bulletEnemyCollision, null, this);
            this.fpsCounter.text = this.game.time.fps;
        },
        
        
        /**
         * Called when a bullet collides with a wall.
         */
        _bulletWallCollision: function(bullet, wall) {
            bullet.frameName = 'bang';
            bullet.body.enable = false;
            this.add.tween(bullet.scale).to({x: 0, y: 0}, 200, Phaser.Easing.Linear.None, true)
                .onComplete.add(function() { this.destroy(); }, bullet);
        },
        
        /**
         * Called when a bullet hits an enemy.
         * @param {Phaser.Sprite} bullet the bullet hitting
         * @param {Lilja.Enemy}   enemy  the enemy hit
         */
        _bulletEnemyCollision: function(bullet, enemy) {
            enemy.onHit(bullet);
            bullet.frameName = 'bang';
            bullet.body.enable = false;
            this.add.tween(bullet.scale).to({x: 0, y: 0}, 200, Phaser.Easing.Linear.None, true)
                .onComplete.add(function() { this.destroy(); }, bullet);
        }
        
    };
    
})();