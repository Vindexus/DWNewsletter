const axios            = require('axios')
const colors           = require('colors')
const fs               = require('fs')
const argparse         = require('argparse')
const ncp              = require('copy-paste')

const parser = new argparse.ArgumentParser({
  addHelp: true,
  description: "Grabs data from the sheet, generates the HTML for newsletter"
})
parser.addArgument(['--output', '-o'], {help: 'Where we save the HTML'})

let args = parser.parseArgs()

axios.get("https://spreadsheets.google.com/feeds/list/1Iv93PGR6NiggbdQeksUcc5p8RX8pMRk3SLPRp_m-w7g/od6/public/values?alt=json")
  .then((data) => {
    var entries = data.data.feed.entry;

    //Convert the spreadsheet data
    entries = entries.map(function (row, index) {
      var entry = {}
      for(var k in row) {
        if(k.indexOf('gsx$') == 0) {
          entry[k.substr('gsx$'.length)] = row[k].$t
        }
      }
      console.log('entry', entry);
      return entry
    })

    //Filter out unapproved or sent
    entries = entries.filter((entry) => {
      if(entry.status !== 'Approved') {
        return false
      }

      if(!entry.title) {
        console.log('Missing entry title'.red)
      }

      if(!entry.url) {
        console.log('Missing entry url'.red)
      }

      return true
    })

    //Turn into html
    entries = entries.map((entry) => {
      var html = '<div style="margin: 0 0 20px 0;">'

      html += '<div class="main-line" style="line-height: 18px; font-size: 14px; margin-bottom: 5px;">'

      html += '<a href="' + entry.url + '" style="color: #1a81ac; font-weight; bold; font-size: 18px;">'

      html +=  entry.title

      if(entry.pdf) {
        html += '<span style="color:#2baadf;"> [PDF]</span> '
      }

      html += '</a> '

      var metas = []

      //Add author if we have one
      if(entry.author) {
        var author = ' by '
        if(entry.authorurl) {
          author += '<a href="' + entry.authorurl + '" class="author" style="color: #666;">' + entry.author + '</a>'
        }
        else {
          author += '<span class="author">' + entry.author + '</span>'
        }
        metas.push(author)
      }

      if(entry.extra) {
        metas.push('<span class="extra">' + entry.extra + '</span>')
      }

      if(entry.domain) {
        metas.push('<span class="domain" style="font-family: Courier New;">' + entry.domain + '</span>')
      }

      html += '<span class="meta" style="color: #666;">' + metas.join(' - ') + '</span>' + '</div>'

      if(entry.description) {
        html += '<div class="description" style="padding: 0 5px 0 0;' + (entry.quote ? 'font-style: italic;' : '') + '">' + entry.description + '</div>'
      }

      html += '</div>'
      return html
    })

    var finalHtml = '<div style="padding-top: 30px; border-top: 1px solid #999; margin-top: 10px;">'

    finalHtml += entries.join("\n")

    finalHtml += '</div>'

    //Write to file
    if(args.output) {
      console.log('TODO: write to a file'.yellow)
    }
    else {
      console.log('-'.repeat(20))
      ncp.copy(finalHtml, ()=> {
        console.log('HTML copied to clipboard')
      })
    }
  })
  .catch((err)=> {
    console.log('err', err.toString().red)
  })
