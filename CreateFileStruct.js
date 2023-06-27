const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, 'test.txt'), { encoding:"utf8" })
const template = JSON.parse(raw.replace(/\\u\d{4}/gm,''))//the replace gets rid of all unnessary characters that may of gotten added on 

const base = path.join(__dirname, 'account_info');

if (!fs.existsSync(base)) { 
    fs.mkdirSync(base, { recursive: true })
}

template.forEach(item => {
    const b = path.join(base, `${item.account.Name.replace(/[\\\/<>:"|?*.]/g, '').replace(/\s/g,'_')}`)
    makeDirectory(b)
        
    const accountInfo = formatTxt(item.account)
    createTxtFile(accountInfo, b, 'info.txt')

    if (item.contacts.length > 0) {
        const cb = path.join(b, 'contacts')
        makeDirectory(cb)

        item.contacts.forEach(contact => {
            const ucb = path.join(cb, `${contact.FirstName}_${contact.LastName}`.replace(/[\\\/<>:"|?*.]/g, '').replace(/\s/g,'_'))
            makeDirectory(ucb)
            const contactInfo = formatTxt(contact)
            createTxtFile(contactInfo, ucb, 'info.txt')

            if (contact.attachments.length > 0) {
                const cab = path.join(ucb, 'attachments')
                makeDirectory(cab)
        
                contact.attachments.forEach(attachment => {
                    const attachmentInfo = formatTxt(attachment)
                    createTxtFile(attachmentInfo, cab, `a_${attachment.Id}.txt`)
                    fs.renameSync("files/"+attachment.Name,cab+"/"+attachment.Name)
                })
            }
        })
    }

    if (item.opportunities.length > 0) {
        const ob = path.join(b, 'opportunities')
        makeDirectory(ob)

        item.opportunities.forEach(opportunity => {
            const uob = path.join(ob, `${opportunity.Name}`.replace(/[\\\/<>:"|?*.]/g, '').replace(/\s/g,'_'))
            makeDirectory(uob)
            const opportunityInfo = formatTxt(opportunity)
            createTxtFile(opportunityInfo, uob, 'info.txt')

            if (opportunity.attachments.length > 0) {
                const oab = path.join(uob, 'attachments')
                makeDirectory(oab)
        
                opportunity.attachments.forEach(attachment => {
                    const attachmentInfo = formatTxt(attachment)
                    createTxtFile(attachmentInfo, oab, `a_${attachment.Id}.txt`)
                    fs.renameSync("files/"+attachment.Name,uob+"/"+attachment.Name)
                })
            }
        })
    }

    if (item.attachments.length > 0) {
        const ab = path.join(b, 'attachments')
        makeDirectory(ab)

        item.attachments.forEach(attachment => {
            const attachmentInfo = formatTxt(attachment)
            createTxtFile(attachmentInfo, ab, `${attachment.Id}.txt`)
            fs.renameSync("files/"+attachment.Name,ab+"/"+attachment.Name)
        })
    }
})

function formatTxt (objectToFormat) {//removed any unnessecary keys 
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

