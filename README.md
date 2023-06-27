# Salesforce-Export
Program that uses REST API and Node.js to fetch all needed information from Salesforce's database. Salesforce uses its own version of SQL called SOQL, similar to SQL but does not need queries such as join, as they are done automatically. All Account info is fetched along with: opportunities, contacts, and attachments. A file structure is then made to store and organize all the information. 

FILE STRUCT: 

Accounts --> Opportunites --> Contacts --> Text file with contact info 
                          --> Attachments --> Attachments and attachment text files
         --> Attachments
         --> Account Text file
All Attachments --> contains all attachments unorganized
Contacts_No_Account --> all contacts not linked to an account, contains text files with info


RUN ORDER: need Node.js, and gracefulFS to run files. 
SalesforceToText.js --> contactsNoAccount.js --> AttachmentsDownload.js --> contactsNoAccountFolderCreate.js --> CreateFileStruct.js


CODE:

AttachmentsDownload.js:
    This downloads all attachments that are stored in the salesforce database. The files are downloaded into a created folder called 'files'.
    
contactsNoAccount.js:
    This code queries all the accounts not connected to an account by using the query parameter: SELECT Name, ..., FROM Contact WHERE AccountId = NULL 
    The output is then written to a textfile. 

contactsNoAccountFolderCreate.js:
    This takes in the text file created in contactNoAccount.js and creates a folder structure called Contacts_No_Account where each contact is a folder 
    with a text file containing all info

CreateFileStruct.js:
    This takes in the test.txt file created in SalesforceToText.js, and the files file struct made in AttachmentsDownload.js to make the full Accounts folder
    It goes through each item in the text file and creates: the account text file containing all the account info, the contacts folder, containing all the 
    contacts and creates their text file, and moves all the attachments into the folder under the folder attachments. 

SalesforceToText.js:
    This code makes the text.txt file, containing all of the query information needed from salesforce.  It then maps the correct information to accounts by using 
    AccountId, Account.Id, and ParentId to link together Accounts, Opporuntites, Contacts, ETc.  Then all the info gets written to the text file. 
