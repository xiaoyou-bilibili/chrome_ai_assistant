import {IDBPDatabase, openDB} from 'idb'
import {v4} from "uuid";
import {GraphInfo} from "./type";
export const storeNameGraph = 'graph'

const getDb = ():Promise<IDBPDatabase> => {
    return openDB('assistant', 1, {
        upgrade(db) {
            db.createObjectStore(storeNameGraph);
        }
    })
}

// 新增数据,返回唯一ID
export const AddData = (data: GraphInfo, table:string=storeNameGraph): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        let db = await getDb()
        // 随机生成一个ID
        data.id = v4()
        db.put(table, data, data.id).then(value => {
            resolve(data.id!)
        })
    })
}

// 直接获取所有的值
export const GetAllData = <T>(table:string=storeNameGraph): Promise<T[]> => {
    return new Promise(async (resolve, reject) => {
        let db = await getDb()
        let data = await db.getAll(table)
        resolve(data)
    })
}

// 获取某一个值
export const GetData = <T>(id:string, table:string=storeNameGraph): Promise<T> => {
    return new Promise(async (resolve, reject) => {
        let db = await getDb()
        let data = await db.get(table, id)
        resolve(data)
    })
}

// 保存数据到数据库
export const SaveData = (id:string, data:any, table:string=storeNameGraph): Promise<IDBValidKey> => {
    return new Promise(async (resolve, reject) => {
        let db = await getDb()
        let res = await db.put(table, data, id)
        resolve(res)
    })
}

// 删除数据
export const DeleteData = (id:string, table:string=storeNameGraph): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        let db = await getDb()
        let res = await db.delete(table, id)
        resolve(res)
    })
}