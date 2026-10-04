const { createClient } = require('bedrock-protocol');
const http = require('http');

// 1. WEB SERVER (Wajib supaya Render tidak mati/crash)
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("Bot Minecraft Bedrock Online!");
}).listen(process.env.PORT || 8080);

// 2. TETAPAN SERVER ATERNOS ANDA (Tukar di sini)
const CONFIG = {
  host: 'hopestudio.aternos.me', // <-- Tukar dengan IP Aternos anda
  port: 19132,                            // <-- Tukar dengan Port 5 digit anda (Nombor sahaja, tanpa pembuka kata)
  username: 'BotAFK',
  offline: true,
  connectTimeout: 45000
};

let bot;
let isConnected = false;

function startBot() {
  if (isConnected) return;
  console.log(`Menyambung ke ${CONFIG.host}:${CONFIG.port}...`);

  try {
    bot = createClient(CONFIG);

    bot.on('spawn', () => {
      console.log('✅ Bot berjaya masuk server!');
      isConnected = true;
      
      // PERGERAKAN RAWAK (Setiap 10 saat untuk elak Aternos Anti-Cheat)
      const afkInterval = setInterval(() => {
        if (isConnected) {
          const randomYaw = Math.floor(Math.random() * 360);
          bot.queue('player_auth_input', {
            pitch: 0,
            yaw: randomYaw,
            position: { x: 0, y: 0, z: 0 },
            moveVector: { x: 0, z: 0 },
            headYaw: randomYaw,
            inputData: { _value: 0n }
          });
          console.log('🤖 Bot memusingkan kepala/badan untuk elak AFK.');
        } else {
          clearInterval(afkInterval);
        }
      }, 10000);
    });

    bot.on('error', (err) => {
      console.error('⚠️ Error:', err.message);
      isConnected = false;
      retryConnection();
    });

    bot.on('close', () => {
      console.log('❌ Putus sambungan. Cuba menyambung semula...');
      isConnected = false;
      retryConnection();
    });

  } catch (err) {
    console.error('Gagal memulakan bot:', err.message);
    retryConnection();
  }
}

function retryConnection() {
  setTimeout(startBot, 20000);
}

startBot();
