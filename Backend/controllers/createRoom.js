import fs from "fs"

export function createRoom(newRoom){
    const filePath = '../backend/arquivos/nome-do-arquivo.json';
    fs.writeFile(filePath, JSON.stringify(newRoom));    

}