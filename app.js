process.on('unhandledRejection', function (err) {
  console.error(err.stack)
})

require('babel-core/register')
require('./api/server.js')