import path from 'path'
import * as Parser from './helpers/parser.helper'
import { 
    ICustomErrorResponseContract,
    IBulkErrorResponseContract, 
    IBulkError 
} from '@getgreenline/products/build/models/product'
const run = async () => {
    const folderPath = path.join(__dirname, 'data')
    const bulkErrors = await Parser.readDir<ICustomErrorResponseContract<IBulkErrorResponseContract>>(folderPath)
    console.log(bulkErrors)
}

run()
