# google-sheets-translate

Maintain your translations in Google Sheets and fetch them into JSON files - ready to be used other translation libraries like [Globalize](https://github.com/jquery/globalize)

## Getting started

Steps to get started with Google documents. See more verbose version in related project: https://github.com/SC5/google-sheets-api

- Register app in [Google Developers Console](https://console.developers.google.com/project)
- Enable Google Drive API
- Create Service account under Credentials (get P12 key)
- Convert P12 key into PEM format
- Collect the service email account
- Create Google Sheets -document
- Share the document to service email address

**NOTE:** Authentication is required - link based sharing is not currently supported.

Example document:

![Bonus: Use GOOGLETRANSLATE for creating initial translations](https://github.com/SC5/google-sheets-translate/raw/master/sheets.png)

Example code:

```javascript
var _ = require('lodash');
var fs = require('fs');

var GoogleSheetsTranslate = require('google-sheets-translate');

var granslator = GoogleSheetsTranslate({
  documentId: 'your-document-id',
  serviceEmail: 'your-generated-service-email@developer.gserviceaccount.com',
  serviceKey: fs.readFileSync('./your-service.pem').toString()
});

var output;
granslator.getTranslations()
.then(function(translations) {
  _.each(translations, function(translation, locale) {
    // Writing files in globalize compatible format
    output = {};
    output[locale] = translation;
    fs.writeFileSync(
      'messages/' + locale + '.json',
      JSON.stringify(output, null, 2)
    );
  })
})
.catch(function(err) {
  console.warn('Failed to generate translations:', err);
});
```

Example output:

```json
{
  "en": {
    "translation": "Translation",
    "dog-house": "Doghouse",
    "sister": "Sister"
  }
}
```
```json
{
  "fi": {
    "translation": "Käännös",
    "dog-house": "Koirankoppi",
    "sister": "Sisko"
  }
}
```

## API

#### new GoogleSheetsTranslate(opts)

Create an instance from the client. All the options are **required**.

* @param {Object} opts               All the options
* @param {String} id                 Sheets document id
* @param {String} opts.serviceEmail  Service email address
* @param {String} opts.serviceKey    Service .PEM key contents

#### gstranslate.getTranslations(opts)

Retrieve the translations from the sheet. All the options are **optional**.

_Note: You should assign either sheetOrdinal or SheetName_
* @param {Object} opts               All the options
* @param {String} opts.sheetOrdinal  Sheet ordinal to process. Defaults to 0 (first sheet)
* @param {String} opts.sheetName     Sheet Name to process
* @param {String} opts.range         Range where the translations are. Defaults to whole document (first row contains the header)

## License

Module is MIT -licensed

## Credit

Module is backed by

<a href="http://sc5.io">
  <img src="http://logo.sc5.io/78x33.png" style="padding: 4px 0;">
</a>
