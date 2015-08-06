(function() {
    
    /**
     * The level contains all objects contained in a game level (player, bullets, enemies), and
     * handles collision detection and other logic of said objects.
     * 
     * @param {Phaser.Game} game reference to the game object
     * @param {String}      name name of the level, same as the name of the tilemap
     */
    Lilja.Level = function(game, name) {

        /**
         * @property {Phaser.Game} reference to the game object.
         */
        this.game = game;
        
        /**
         * @property {String} the name of this level
         */
        this.name = name;
        
        /** 
         * @property {Phaser.Tilemap} the level tilemap
         */
        this.map = this.game.add.tilemap(name);
        
        /**
         * @property {Phaser.TilemapLayer} the layer containing the whole background
         */
        this.mapLayer = null;
        
        /**
         * @property {Phaser.Group} group containing the enemies
         */
        this.enemies = this.game.add.group();
    };
    
    
    Lilja.Level.prototype = {
        
        /**
         * @property {Object} static settings for the level objects
         */
        settings: {
            zombieID: 11
        },
        
        /**
         * Creates the map. Uses a loaded tileset with the same name given as the 
         * name of this level.
         */
        create: function() {
            this.map.addTilesetImage('tiles', 'tiles');
            
            this.mapLayer = this.map.createLayer('bg');
            this.mapLayer.resizeWorld();
            
            this.map.setCollisionByExclusion([1, 10], true, this.layerBg, true);
            
            this.game.world.sendToBack(this.mapLayer);
            
            /**
             * @property {Phaser.Audio} intro music for the level
             */
            this.introMusic = this.game.add.audio('intromusic');
            
            /**
             * @property {Phaser.Audio} the background music for the level.
             */
            this.bgMusic = this.game.add.audio('leveldrums');
            this.bgMusic.loop = true;
            this.bgMusic.volume = 0.6;
        },
        
        /**
         * Populate the map with enemies and get references for other 
         * objects based on the objects in the tilemap.
         *
         * @see Lilja.Level.settings.zombieID
         * @param {Lilja.Player} player reference to the player object
         * @returns {Phaser.Group} the enemy group created
         */
        createObjects: function(player) {
            this.player = player;
            this.bullets = player.bullets;
            
            this.map.createFromObjects('spawnpoints', this.settings.zombieID, 'sprites', null, true, false, this.enemies, Lilja.Zombie, true);
            this.enemies.setAll('chase', this.player);
            this.enemies.setAll('ground', this.mapLayer);
            
            return this.enemies;
        },
        
        /**
         * Handle collisions between objects and the level map.
         */
        handleCollisions: function() {
            this.game.physics.arcade.collide(this.player, this.enemies, this._playerEnemyCollision, this._playerEnemyProcess, this);
            this.game.physics.arcade.collide(this.bullets, this.mapLayer, this._bulletWallCollision, null, this);
            this.game.physics.arcade.collide(this.bullets, this.enemies, this._bulletEnemyCollision, null, this);
            this.game.physics.arcade.collide(this.player, this.mapLayer);
            this.game.physics.arcade.collide(this.enemies, this.mapLayer);
            this.game.physics.arcade.collide(this.giblets, this.mapLayer);
        },
        
        intro: function() {
            this.introMusic.play();
            
            this.player.disableControls = true;
            this.player.animations.play('walk');
            var walk = this.game.add.tween(this.player).from({x: -30 }, 2000, Phaser.Easing.Linear.None, true);
            walk.onComplete.add(this._beginIntro, this);
        },
        
        /**
         * Called when a bullet collides with a wall.
         */
        _bulletWallCollision: function(bullet, wall) {
            bullet.hit(wall);
        },
        
        /**
         * Preprocess player and enemy collisions.
         */
        _playerEnemyProcess: function(player, enemy) {
            return !player.invincible;
        },
        
        /**
         * Called when a bullet collides with a wall.
         */
        _playerEnemyCollision: function(player, enemy) {
            player.hit(enemy.damage);
        },
        
        /**
         * Called when a bullet hits an enemy.
         * @param {Phaser.Sprite} bullet the bullet hitting
         * @param {Lilja.Enemy}   enemy  the enemy hit
         */
        _bulletEnemyCollision: function(bullet, enemy) {
            enemy.hit(bullet);
            bullet.hit(enemy);
        },
        
        /**
         * Start the level introduction.
         */
        _beginIntro: function() {
            this.player.animations.play('stand');
            this.dialogue = new Lilja.DialogueManager(this.game);
            this.dialogue.start(this.name + '_intro');
            this.dialogue.onFinished.addOnce(this._startMission, this);
        },
        
        /**
         * Start player involvement and show 'start mission' text.
         * Called after the intro has finished.
         */
        _startMission: function() {
            this.player.disableControls = false;
            this.player._makeHP();
            this.introMusic.stop();
            this.bgMusic.play();
            this._showMissionStartText();
        },
        
        /**
         * Shows a flashing 'mission start' text.
         */
        _showMissionStartText: function() {
            this._flash = this.game.add.text(this.game.camera.width / 2, this.game.camera.height / 2, 
                                             'MISSION START', { font: '32px VT323', fill: '#FFFFFF' });
            this._flash.anchor.set(0.5);
            this._flash.fixedToCamera = true;
            
            this._flashTimer = this.game.time.create(false);
            this._flashTimer.repeat(600, 5, function() { this._flash.visible = !this._flash.visible; }, this);
            this._flashTimer.start();
        }
        
    };
    
})();