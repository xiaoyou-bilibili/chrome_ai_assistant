import {FunctionType} from "../../../common/type";

export type HandleCallback = (type: FunctionType, data: any) => Promise<string>;