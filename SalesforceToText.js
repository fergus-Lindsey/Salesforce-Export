const jsforce = require('jsforce');
const https = require('https');
const fs = require('fs');
const path = require('path');

//Connection to salesforce information
const username = '';
const password = '';
const securityToken = '';

//makes the connection to salesforce
var conn = new jsforce.Connection();
conn.login(username, password + securityToken, async function(err, res) {
  
    if (err) { return console.error(err); }//if can't make connection it will throw an error

    //queries everything from the accounts table stored in salesforce
    //this query only gets the first 2000 table entries, due to API limits
    let accounts = await conn.query("SELECT Id, Name, ParentId, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry, ShippingStreet, ShippingCity, ShippingState, ShippingPostalCode, ShippingCountry, Phone, Fax, Website FROM Account", function(err, res) {
        if (err) { return console.error(err); }
        return res

    }).then(async res => {//this will get the rest of the entires past the 2000 limit, by using querymore 
        let done = res.done
        let results = res.records
        let next = res.nextRecordsUrl
        while (!done) {
            console.log(`Account: ${next}`)//prints accounts
            await conn.queryMore(next)
            .then(res => {
                done = res.done
                next = res.nextRecordsUrl
                results = [...results, ...res.records]
            })
        }
        return results
    })

    //queries everything from the opportunities table stored in salesforce
    let opportunities = await conn.query("SELECT Id, AccountId, Name, Description, Application_Number__c, Applicant_Name__c, Applicant_Email__c, Applicant_Rep_Name__c, Applicant_Rep_Email__c, Contact__c, Entegrus_Invoice_Number__c FROM Opportunity", function(err, res) {
        if (err) { return console.error(err); }
        return res

    }).then(async res => {
        let done = res.done
        let results = res.records
        let next = res.nextRecordsUrl

        while (!done) {
            console.log(`Opportunities: ${next}`)
            await conn.queryMore(next)
            .then(res => {
                done = res.done
                next = res.nextRecordsUrl
                results = [...results, ...res.records]
            })
        }
        return results
    })

    //queries everything from the contacts table stored in salesforce
    let contacts = await conn.query("SELECT Id, AccountId, FirstName, LastName, OtherStreet, OtherCity, OtherState, OtherPostalCode, OtherCountry, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry, Phone, Fax, MobilePhone, HomePhone, OtherPhone, AssistantPhone, Email, Description, Company_if_no_linked_account__c FROM Contact", function(err, res) {
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
    
    //queries everything from the attachments table stored in salesforce
    let attachments = await conn.query("SELECT Id, ParentId, Name, ContentType FROM Attachment", function(err, res) {
        if (err) { return console.error(err); }
        return res

    }).then(async res => {
        let done = res.done
        let results = res.records
        let next = res.nextRecordsUrl

        while (!done) {
            console.log(`Attachments: ${next}`)
            await conn.queryMore(next, { maxFetch: 2000 })
            .then(more => {
                done = more.done
                next = more.nextRecordsUrl
                results = [...results, ...more.records]
            })
        }
        return results
    })

    //once all the queries are done, the results are passed to the jsonFile function 
    jsonFile(accounts, opportunities, contacts, attachments)
});

//this function links all the opportunities, contacts, and attachments to the correct account
function jsonFile(accounts, opportunities, contacts, attachments) {
    let results = accounts.map(account => {
        //maps all contacts, opps, and attachments to the account
        let aContacts = contacts.filter(c => c.AccountId === account.Id)//matches the Accounts: ID --> Contacts: AccountId
        let aOpportunities = opportunities.filter(o => o.AccountId === account.Id)//matches the Accounts: ID --> Opportunities: AccountId
        let aAttachments = attachments.filter(a => a.ParentId === account.Id)//matches the Accounts: ID --> Attachments: AccountId

        aOpportunities = aOpportunities.map(o => {//matches the attachemnts to the correct opportunity 
          o.attachments = attachments.filter(a => a.ParentId === o.Id)
          return o
        })

        aContacts = aContacts.map(c => {//matches the contacts to the correct opportunity 
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
    //this writes everything to a text file, which then gets passed to another program that creates and downloads the files
    fs.writeFileSync(path.join(__dirname, 'Salesforce_AccountsOppsContactsAttach.txt'), JSON.stringify(results), { encoding: 'utf8' })
}
