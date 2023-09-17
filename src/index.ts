import path from 'path'
import fs from 'fs/promises'
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
    const frequencyInsigths = Parser.getTalliedErrors(tallied)
    const csvData = Parser.transFormToCSV(frequencyInsigths)
    fs.writeFile('./report.csv', csvData)
    const c614_ext_errors = Parser.getCategoryBulkErrors({
        companyId: '2917',
        talliedBulkErrors: tallied,
        errorCategoryType: Parser.EErrorCategory.IMG_URL_EXT
    })
    const c614_ext = c614_ext_errors?.map((err) => err.value)?.map((err) => err?.split('.').pop())
    const c614_ext_unique = [ ...new Set(c614_ext)]
    // const temps = await fs.readdir(path.join(__dirname, 'temp'))
    // temps.forEach(async (file) => {
    //     const fileName = file.replace('.csv', '.json')
    //     const filePath = path.join(__dirname, 'junk', fileName)
    //     await fs.writeFile(filePath, '')
    //     console.log(filePath)
    // })
    console.log(c614_ext_unique)
}

run()
