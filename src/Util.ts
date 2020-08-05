import _ from "lodash";

export function notNil<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export type StringKeyObject = { [key: string]: any };


export const shoutFullFormat = 'YYYYMMDDHHmmssSSSS'