var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};
var game = new Phaser.Game(config);

function preload() {
  this.load.image('bug', 'assets/duck.png');
  this.load.image('otherPlayer', 'assets/chick.png');
}

function create() {
  var self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();

  this.socket.on('currentPlayers', (players) => {
    Object.keys(players).forEach((id) => {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    })
  });

  this.socket.on('newPlayer', (playerInfo) => {
    addOtherPlayers(self, playerInfo);
  });

  this.socket.on('disconnectPlayer', (playerId) => {
    self.otherPlayers.getChildren().forEach((otherPlayer) => {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    })
  })

  this.socket.on('playerUpdated', (playerInfo) => {
    self.otherPlayers.getChildren().forEach((otherPlayer) => {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    })
  })

  // this.input.on('pointerdown', (e) => {
  //   this.player.x = e.x;
  //   this.player.y = e.y;
  // })

}

function update() {
  if (!this.player) return

  this.socket.emit('playerUpdate', {x: this.player.x, y: this.player.y});
  if (this.input.activePointer.isDown) {
    this.player.x = this.input.activePointer.x;
    this.player.y = this.input.activePointer.y;
  }
}

function addPlayer(self, playerInfo) {
  self.player = self.physics.add.image(playerInfo.x, playerInfo.y, "bug").setOrigin(0.5, 0.5);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}