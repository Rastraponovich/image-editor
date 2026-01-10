declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;
declare const __GIT_HASH__: string;

export const APP_VERSION = __APP_VERSION__;
export const BUILD_DATE = __BUILD_DATE__;
export const GIT_HASH = __GIT_HASH__;

export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;
