import * as fs from 'fs/promises'
import * as path from 'path'
import { 
    ICustomErrorResponseContract,
    IBulkErrorResponseContract, 
    IBulkError 
} from '@getgreenline/products/build/models/product'

export const readDir = async <T>(folderPath: string) => {
    const fileNames = await fs.readdir(folderPath)
    const fileObjectMap: Map<string, T> = new Map()
    for(let filename of fileNames) {
        const filePath = path.join(folderPath, filename)
        const buffer = await fs.readFile(filePath, 'utf-8')
        const file: T = JSON.parse(buffer)
        fileObjectMap.set(filename, file)
    }
    return fileObjectMap
}

export const transformCustomReposeToBulkError = (fileObjectMap: Map<string,ICustomErrorResponseContract<IBulkErrorResponseContract>>) => {
    const bulkErrorsMap: Map<string, IBulkError[]> = new Map()
    for(let key of fileObjectMap.keys()) {
        const [companyId] = key.replace('prod-', '').split('.')
        const oldValue = fileObjectMap.get(key)
        const newValue = oldValue?.customErrorObject.details ?? []
        bulkErrorsMap.set(companyId, newValue)
    }
    return bulkErrorsMap
}

export const tallyBulkErrors = (bulkErrorsMap: Map<string, IBulkError[]>) => {
    const tallyMap: Map<string, Map<string, IBulkError[]>> = new Map()
    for(let key of bulkErrorsMap.keys()){
        const oldValue = bulkErrorsMap.get(key) ?? []
        const talliedBulkErrorMap: Map<string, IBulkError[]> = new Map()
        for(let error of oldValue) {
           const existingValue = talliedBulkErrorMap.get(error.message)
           if(!existingValue) {
                talliedBulkErrorMap.set(error.message, [error])
           } else {
                talliedBulkErrorMap.set(error.message, [...existingValue, error])
           }
        }
        tallyMap.set(key, talliedBulkErrorMap)
    }
    return tallyMap
}