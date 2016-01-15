var fs = require('fs');
var Promise = require('polyfill-promise');
var _ = require('lodash');
var Sheets = require('google-sheets-api').Sheets;

/**
 * Create an instance from the client. All the options are **required**.
 *
 * @param {Object} opts               All the options
 * @param {String} id                 Sheets document id
 * @param {String} opts.serviceEmail  Service email address
 * @param {String} opts.serviceKey    Service .PEM key contents
 */
function GoogleSheetsTranslate(opts) {
  this.documentId = opts.documentId;
  this.sheets = new Sheets({
    email: opts.serviceEmail,
    key: opts.serviceKey
  });
}

/**
* Retrieve the translations from the sheet. All the options are **optional**.
*
* @param {Object} opts               All the options
* @param {String} opts.sheetOrdinal  Sheet ordinal to process. Defaults to 0 (first sheet)
* @param {String} opts.range         Range where the translations are. Defaults to whole document (first row contains the header)
*/
GoogleSheetsTranslate.prototype.getTranslations = function(opts) {
  opts = opts || {}

  var _this = this;
  var documentId = _this.documentId;
  var columnLocaleMap = {};
  var translations = {};

  return _this.sheets.getSheets(documentId)
    .then(function(sheetsInfo) {
      var sheetInfo = _.find(sheetsInfo, function(info) {
        return info.title == opts.sheetName;
      });
      sheetInfo = sheetInfo || sheetsInfo[opts.sheetOrdinal || 0];
      return Promise.all([
        _this.sheets.getSheet(documentId, sheetInfo.id),
        _this.sheets.getRange(documentId, sheetInfo.id, opts.range)
      ]);
    })
    .then(function(output) {
      var sheetInfo = output[0];
      var content = output[1];

      _.each(content, function(row, rowIndex) {
        // Assume first line to contain key and language codes
        if (rowIndex === 0) {
          _.each(row, function(column, colIndex) {
            columnLocaleMap[column.column] = column.content;
            // Collect the language codes
            if (column.content !== 'key') {
              translations[column.content] = {};
            }
          });
          return;
        }

        // Process content
        var translationKey;
        _.each(row, function(column, colIndex) {
          // Take the translation key from first column
          if (colIndex === 0) {
            translationKey = column.content;
            return;
          }
          // Generate tree: { languageCode: { translationKey: 'translation', ...}}
          translations[columnLocaleMap[column.column]][translationKey] = column.content;
        });
      });

      return translations;
    });
}

module.exports =  GoogleSheetsTranslate;
