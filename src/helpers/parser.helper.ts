import * as fs from 'fs/promises'
import * as path from 'path'
import * as papa from 'papaparse'
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
        const [companyId] = key.split('.')
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

export const getTalliedErrors = (tallyMap: Map<string, Map<string, IBulkError[]>>) => {
    const talliedCompanyIdMap: Map<string, Map<string, number>> = new Map()
    for(let companyId of tallyMap.keys()){
        const talliedCategoriesMap: Map<string, number> = new Map()
        const items = tallyMap.get(companyId)
        for(let category of items?.keys() ?? []){
            const errors = tallyMap.get(companyId)?.get(category)
            talliedCategoriesMap.set(category, errors?.length ?? 0)
        }
        talliedCompanyIdMap.set(companyId, talliedCategoriesMap)
    }
    return talliedCompanyIdMap
}

export const transFormToCSV = (tallyMap: Map<string, Map<string, number>>) => {
    const headers = ['messages', ...tallyMap.keys()]
    const csvData = [headers]
    const messageColumnCategories = getErrorTypes(tallyMap)
    const getMessageRowNumber = (message: string) => {
        const index = messageColumnCategories.findIndex((e) => e === message)
        return index !== -1 ? index + 1 : undefined
    }
    const getColumnIndex = (message: string) => {
        const index = headers.findIndex((e) => e === message)
        return index !== -1 ? index : undefined
    }
    messageColumnCategories.forEach((errorCategory) => {
        csvData.push([errorCategory])
    })
    for(let header of headers){
        if (header === 'message' || undefined) continue
        const columnDataRows = tallyMap.get(header)
        if(!columnDataRows) continue
        for(let rowDataKey of columnDataRows.keys()){
            const rowData = columnDataRows.get(rowDataKey)
            const rowIndex = getMessageRowNumber(rowDataKey)
            const coumnIndex = getColumnIndex(header)
            if(!rowIndex || !coumnIndex) continue
            const values = {
                rowIndex,
                coumnIndex,
                rowData,
                rowDataKey
            }
            csvData[rowIndex][coumnIndex] = `${rowData}`
        }
    }
    const csv = papa.unparse(csvData)
    return csv
}

export const getErrorTypes = (tallyMap: Map<string, Map<string, number>>) => {
    const errorTypeSet: Set<string> = new Set()
    for(let subMapKey of tallyMap.keys()){
        [...(tallyMap.get(subMapKey)?.keys()) ?? []].forEach((e) => {
            errorTypeSet.add(e)
        })
    }
    return [...errorTypeSet.values()]
}