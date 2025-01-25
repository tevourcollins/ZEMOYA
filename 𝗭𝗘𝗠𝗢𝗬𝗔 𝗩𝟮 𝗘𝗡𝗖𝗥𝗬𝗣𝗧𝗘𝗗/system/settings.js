const fs = require('fs')

global.owner = "2349033658868"
global.footer = "𝐙𝐄𝐌𝐎𝐘𝐀 𝐕𝟐 𝐈𝐒 𝐇𝐄𝐑𝐄"
global.idsal = ""
global.image = "https://itzpire.com/file/9d194738132e.png"
global.linksal = "https://whatsapp.com/channel/0029VaqtYx55Ejy0AP7oD124"
global.autoread = false //true/false

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file)
  console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
  delete require.cache[file]
  require(file)
})
