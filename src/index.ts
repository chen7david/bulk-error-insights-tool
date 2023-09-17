import path from 'path'
import * as Parser from './helpers/parser.helper'
import { 
    ICustomErrorResponseContract,
    IBulkErrorResponseContract, 
    IBulkError 
} from '@getgreenline/products/build/models/product'
const run = async () => {
    const folderPath = path.join(__dirname, 'data')
    const bulkErrorResponses = await Parser.readDir<ICustomErrorResponseContract<IBulkErrorResponseContract>>(folderPath)
    const bulkErrorsMap =  Parser.transformCustomReposeToBulkError(bulkErrorResponses)
    const tallied = Parser.tallyBulkErrors(bulkErrorsMap)
    console.log(tallied)
}

run()
