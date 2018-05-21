// This is invoked by SlimerJS
const fs = require('fs') // SlimerJS "fs", not Node "fs"
const webpage = require('webpage')

const page = webpage.create()
page.settings.javascriptEnabled = false
page.settings.localToRemoteUrlAccessEnabled = false
page.paperSize = { format: 'Letter', orientation: 'Portrait', margin: '20pt' }

page.onResourceRequested = function(requestData, networkRequest) {
  const url = requestData.url

  if (url.startsWith('file:') && url.endsWith('/input.html')) {
    // this is the input file. Load it normally.
  } else if (url.startsWith('data:')) {
    // this is a data: URL, which means the content is embedded in the page.
    // Load it normally.
  } else {
    // Aside from page.html and data: URLs, we don't want any other requests.
    // The others would be either network requests (which are slow and
    // unreliable -- nondeterministic, too) or file:// requests (which are
    // insecure).
    networkRequest.abort()
  }
}

page.open('input.html', function(status) {
  if (status === 'success') {
    page.render('0.blob', { format: 'pdf' })
    fs.write('0.txt', page.plainText)
  } else {
    console.log('Error: ' + status)
  }

  slimer.exit()
})
