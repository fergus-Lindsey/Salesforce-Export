const fs = require('fs');
const path = require('path');
const jsforce = require('jsforce');
const https = require('https');
const username = '';
const password = '';
const securityToken = '';

const JSONStream = require( "JSONStream" );
const gracefulFs = require('graceful-fs');

const raw = fs.readFileSync(path.join(__dirname, 'contactsNo.txt'), 'utf8')
const template = JSON.parse(raw.replace(/\\u\d{4}/gm,''))

var conn = new jsforce.Connection();
const async = require("async")

conn.login(username, password + securityToken, async function(err, res) {

    const base = path.join(__dirname, 'Contacts_No_Account');

    if (!fs.existsSync(base)) { 
        fs.mkdirSync(base, { recursive: true })
    }
   
    template.forEach((item) => {
        const ucb = path.join(base, `${item.FirstName}_${item.LastName}`.replace(/[\\\/<>:"|?*.]/g, ''))
        makeDirectory(ucb)
        const contactInfo = formatTxt(item)
        createTxtFile(contactInfo, ucb, 'Info.txt')
    })

    function formatTxt (objectToFormat) {
        const keys = Object.keys(objectToFormat)
        return keys.reduce((r, k) => {
            if (k === 'attributes' || k === 'attachments') return r
            return `${r}\n${k}: ${objectToFormat[k]}`
        }, '')
    }

    function makeDirectory (dir) {
        try {
            if (!fs.existsSync(dir)) { 
                fs.mkdirSync(dir, { recursive: true })
            }    
        } catch (error) {
            console.log(`BAD PATH: ${dir}`)
        }
    }

    function createTxtFile (text, dir, name) {
        fs.writeFileSync(path.join(dir, name), text)
    }
 
})

