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

  let contacts = await conn.query("SELECT Id, AccountId, FirstName, LastName, OtherStreet, OtherCity, OtherState, OtherPostalCode, OtherCountry, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry, Phone, Fax, MobilePhone, HomePhone, OtherPhone, AssistantPhone, Email, Description, Company_if_no_linked_account__c FROM Contact WHERE AccountId= NULL", function(err, res) {
    if (err) { return console.error(err); }
    return res
  }).then(async res => {
    let done = res.done
    let results = res.records
    let next = res.nextRecordsUrl

    while (!done) {
      console.log(`Contacts: ${next}`)
      await conn.queryMore(next)
      .then(res => {
        done = res.done
        next = res.nextRecordsUrl
        results = [...results, ...res.records]
      })
    }

    return results
  })
  fs.writeFileSync(path.join(__dirname, 'contactsNo.txt'), JSON.stringify(contacts), { encoding: 'utf8' })


 // jsonFile(accounts, opportunities, contacts, attachments)
});

function jsonFile(accounts, opportunities, contacts, attachments) {
    /*
    let results = accounts.map(account => {
        let aContacts = contacts.filter(c => c.AccountId === account.Id)
        let aOpportunities = opportunities.filter(o => o.AccountId === account.Id)

        let aAttachments = attachments.filter(a => a.ParentId === account.Id)

        aOpportunities = aOpportunities.map(o => {
          o.attachments = attachments.filter(a => a.ParentId === o.Id)
          return o
        })

        aContacts = aContacts.map(c => {
          c.attachments = attachments.filter(a => a.ParentId === c.Id)
          return c
        })

        return {
            account: account,
            contacts: aContacts,
            opportunities: aOpportunities,
            attachments: aAttachments
        }
    })
*/
    fs.writeFileSync(path.join(__dirname, 'ContactsNoAccount.txt'), JSON.stringify(results), { encoding: 'utf8' })
}

function downloadFile(conn, record) {

  let dir = path.join(__dirname, 'files', record.ParentId);

  console.log(dir);

  if (!fs.existsSync(dir)) { 
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch (error) {
      console.log(error)
    }
  }

  console.log(record)

  const options = {
      hostname: 'entegrus.my.salesforce.com',
      port: 443,
      path: record.Body,
      method: 'GET',
      headers: {
          'Content-Type': record.ContentType,
          'Authorization': 'OAuth '+conn.accessToken
      }
  }

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
      });

  }).on("error", (err) => {
      console.log("Error: " + err.message);
  });
}