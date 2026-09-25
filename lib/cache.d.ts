export declare function getCacheKey(): {
    primaryKey: string;
    restoreKeys: string[];
};
export declare function saveCache(): Promise<void>;
export declare function restoreCache(): Promise<void>;
