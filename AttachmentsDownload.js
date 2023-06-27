const jsforce = require('jsforce');
const https = require('https');
const fs = require('fs');
const path = require('path');
const username = '';
const password = '';
const securityToken = '';

var conn = new jsforce.Connection();

conn.login(username, password + securityToken, async function(err, res) {
  if (err) { return console.error(err); }
  
  let attachments = await conn.query("SELECT Id, ParentId, Name, ContentType FROM Attachment", function(err, res) {
    if (err) { return console.error(err); }
    return res
  }).then(async res => {
    let done = res.done
    let results = res.records
    let next = res.nextRecordsUrl

    while (!done) {
      await conn.queryMore(next, { maxFetch: 2000 })
      .then(more => {
        done = more.done
        next = more.nextRecordsUrl
        results = [...results, ...more.records]
      })
    }

    return results
  })

  let i = 1
  for (const attachment of attachments) {
    await downloadFile(conn, attachment)
    console.log(`${i} / ${attachments.length}`)
    i++
  }
});

function downloadFile(conn, record) {

  let dir = path.join(__dirname, 'files');

  if (!fs.existsSync(dir)) { 
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch (error) {
      console.log(error)
    }
  }

  const options = {
      hostname: 'entegrus.my.salesforce.com',
      port: 443,
      path: `${record.attributes.url}/Body`,
      method: 'GET',
      headers: {
          'Content-Type': record.ContentType,
          'Authorization': 'OAuth '+conn.accessToken
      }
  }

  return new Promise((resolve, reject) => {
    https.get(options, (resp) => {
      let data = '';

      // A chunk of data has been received.
      resp.on('data', (chunk) => {
          data += chunk;

          fs.appendFileSync(`${dir}/${record.Name}`, chunk, function (err) {
              if (err) throw err;           
          });
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
          console.log('data downloaded');
          resolve(true)
      });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
        reject(false)
    });
  })
}