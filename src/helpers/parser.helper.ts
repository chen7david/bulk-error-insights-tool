import * as fs from 'fs/promises'
import * as path from 'path'


export const readDir = async <T>(folderPath: string) => {
    const fileNames = await fs.readdir(folderPath)
    const fileObject: T[] = []
    for(let filename of fileNames) {
        const filePath = path.join(folderPath, filename)
        const buffer = await fs.readFile(filePath, 'utf-8')
        const file: T = JSON.parse(buffer)
        fileObject.push(file)
    }
    return fileObject
}