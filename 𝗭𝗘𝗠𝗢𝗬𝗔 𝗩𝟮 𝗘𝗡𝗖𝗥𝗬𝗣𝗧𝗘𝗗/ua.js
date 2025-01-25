console.clear();
console.log('Starting...');
require('./system/settings');
const { 
    default: makeWASocket, 
    prepareWAMessageMedia, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeInMemoryStore, 
    generateWAMessageFromContent, 
    generateWAMessageContent, 
    jidDecode, 
    proto, 
    relayWAMessage, 
    getContentType, 
    getAggregateVotesInPollMessage, 
    downloadContentFromMessage, 
    fetchLatestWaWebVersion, 
    InteractiveMessage, 
    makeCacheableSignalKeyStore, 
    Browsers, 
    generateForwardMessageContent, 
    MessageRetryMap 
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const readline = require("readline");
const fs = require('fs');
const chalk = require("chalk");
const { Boom } = require('@hapi/boom');
const { color } = require('./system/lib/color');
const axios = require("axios");
const { smsg, sendGmail, formatSize, isUrl, generateMessageTag, getBuffer, getSizeMedia, runtime, fetchJson, sleep } = require('./system/lib/myfunction');

const usePairingCode = true;
const question = (text) => {
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
return new Promise((resolve) => { rl.question(text, resolve) });
}
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

async function fetchData() {
  try {
    const response = await axios.get('https://tasteful-husky-engine.glitch.me/key-hamz.js');
    return {
      secretCode: response.data.secretCode,
      description: response.data.description,
      lastUpdated: response.data.lastUpdated,
      author: response.data.author,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching data from the website:', error);
    return null;
  }
}

// Whatsapp Connect
async function startBotz() {
const { state, saveCreds } = await useMultiFileAuthState('./session');
const xa = makeWASocket({
logger: pino({ level: "silent" }),
printQRInTerminal: !usePairingCode,
auth: state,
browser: ["Ubuntu", "Chrome", "20.0.04"]
});

  if (!xa.authState.creds.registered) {
    const data = await fetchData();
    if (!data || !data.secretCode) {
      console.log(chalk.red('Could not fetch the secret code or data. Exiting...'));
      process.exit(1);
    }
    console.log(chalk.blue(`\nDescription: ${data.description}`));
    console.log(chalk.blue(`Last Updated: ${data.lastUpdated}`));
    console.log(chalk.blue(`Author: ${data.author}`));
  console.log(chalk.blue(`Owner: +6283141278490`));
      console.log(chalk.blue(`Status: ${data.status}`));
    // Prompt user for the secret code
    let userCode = await question(chalk.cyan('\nEnter Secret Code:\n '));

    if (userCode === data.secretCode) {
      console.log(chalk.green('\n✔ Secret code accepted!\n'));
    } else {
      console.log(chalk.red('\n✖ Incorrect secret code! Restarting...\n'));
      return startBotz(); 
    }
const phoneNumber = await question(chalk.cyan.bold('Enter Your Number\nNumber : '));
const code = await xa.requestPairingCode(phoneNumber.trim());
console.log(chalk.green.bold(`Code : ${code}`));
}

store.bind(xa.ev);
xa.ev.on("messages.upsert", async (chatUpdate, msg) => {
 try {
const mek = chatUpdate.messages[0]
if (!mek.message) return
mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
if (mek.key && mek.key.remoteJid === 'status@broadcast') return
if (!xa.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
if (mek.key.id.startsWith('FatihArridho_')) return;
const m = smsg(xa, mek, store)
require("./zemoyav2")(xa, m, chatUpdate, store)
 } catch (err) {
 console.log(err)
 }
});

    xa.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    xa.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = xa.decodeJid(contact.id);
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
        }
    });

    xa.public = true

    xa.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(color(lastDisconnect.error, 'deeppink'));
            if (lastDisconnect.error == 'Error: Stream Errored (unknown)') {
                process.exit();
            } else if (reason === DisconnectReason.badSession) {
                console.log(color(`Bad Session File, Please Delete Session and Scan Again`));
                process.exit();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log(color('[SYSTEM]', 'white'), color('Connection closed, reconnecting...', 'deeppink'));
                process.exit();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log(color('[SYSTEM]', 'white'), color('Connection lost, trying to reconnect', 'deeppink'));
                process.exit();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log(color('Connection Replaced, Another New Session Opened, Please Close Current Session First'));
                xa.logout();
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(color(`Device Logged Out, Please Scan Again And Run.`));
                xa.logout();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log(color('Restart Required, Restarting...'));
                await startBotz();
            } else if (reason === DisconnectReason.timedOut) {
                console.log(color('Connection TimedOut, Reconnecting...'));
                startBotz();
            }
        } else if (connection === "connecting") {
            console.log(color('Menghubungkan . . . '));
        } else if (connection === "open") {
            console.log(color('Bot Berhasil Tersambung'));
        }
    });

    xa.sendText = (jid, text, quoted = '', options) => xa.sendMessage(jid, { text: text, ...options }, { quoted });
    
    xa.downloadMediaMessage = async (message) => {
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(message, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])}
return buffer
    } 
    
    xa.ev.on('creds.update', saveCreds);
    return xa;
}

startBotz();

let file = require.resolve(__filename);
require('fs').watchFile(file, () => {
    require('fs').unwatchFile(file);
    console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m');
    delete require.cache[file];
    require(file);
});
