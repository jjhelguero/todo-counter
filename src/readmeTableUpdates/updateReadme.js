const fs = require('fs')
const debug = require('debug')('updateReadMeTodoCounter')
const path = require("path")
const {extractTableFromReadme, maybeUpdateReadmeTable, COUNT_TYPE, FILE_ENCODING} = require('./utils')


/**
 * Only updates table counter if there is a change in most recent and current found count
 * @param {Number} count 
 * @param {String} type 
 */
function maybeUpdateReadMeCounter(count, countType) {
  const readmeFile = 'README.md'
  let headerString, tableHeaderTag
  
  if(countType == COUNT_TYPE.TODO.type) {
    headerString = 'Todo'
    tableHeaderTag  = COUNT_TYPE.TODO.rowTag
  } else if (countType == COUNT_TYPE.SKIP.type){
    headerString = 'SkippedTests'
    tableHeaderTag  = COUNT_TYPE.SKIP.rowTag
  }

  debug(`Reading ${readmeFile} file`)
  const relativePath = `../../${readmeFile}`

  const fullPath = path.resolve(__dirname, relativePath)
  const readMeContent = fs.readFileSync(fullPath, FILE_ENCODING, function (err, data) {
    if (err) throw err
  })
  const countTable = extractTableFromReadme(fullPath, headerString)

  maybeUpdateReadmeTable(readmeFile, readMeContent, countTable, count, tableHeaderTag)
}

;(module.exports = maybeUpdateReadMeCounter)