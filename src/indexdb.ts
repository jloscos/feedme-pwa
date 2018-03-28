export class IndexDBHelper {
    static readonly dbName = "FeedMeDb";

    public static openDB(): Promise<IDBDatabase> {
        return new Promise<IDBDatabase>((resolve, reject) => {
            const request = self.indexedDB.open(IndexDBHelper.dbName);
            request.onsuccess = event => {
                resolve(request.result);
            };
            request.onerror = (event: any) => {
                reject(request.error);
            };
            request.onupgradeneeded = (event: any) => {
                const db: IDBDatabase = event.target.result;
                if (!db.objectStoreNames.contains("feed")) {
                    const store = db.createObjectStore("feed", { keyPath: "feedId" });
                }
                if (!db.objectStoreNames.contains("article")) {
                    const store = db.createObjectStore("article", { keyPath: "articleId" });
                    store.createIndex("FeedIndex", "feedId", { unique: false });
                }
                if (!db.objectStoreNames.contains("cachedArticle")) {
                    const store = db.createObjectStore("cachedArticle", { keyPath: "cacheKey" });
                }
            };
        });
    }

    public static async setValue<T>(storeName: string, value: T): Promise<Boolean> {
        const db = await IndexDBHelper.openDB();
        return new Promise<Boolean>((resolve, reject) => {
            const transaction: IDBTransaction = db.transaction(storeName, 'readwrite');
            const store: IDBObjectStore = transaction.objectStore(storeName);
            const request: IDBRequest = store.put(value);
            request.onsuccess = event => {
                resolve(true);
            };
            request.onerror = (event: any) => {
                transaction.abort();
                reject(event.error);
            };
        });
    }

    public static async getValue<T>(storeName: string, key: any): Promise<T> {
        const db = await IndexDBHelper.openDB();        
        return new Promise<T>((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = event => {
                resolve(request.result);
            };
            request.onerror = (event: any) => {
                reject(event.error);
            };
        });
    }

    public static async searchValues<T>(storeName: string, search: any = null): Promise<T[]> {
        const db = await IndexDBHelper.openDB();        
        const range = IDBKeyRange.lowerBound(search);
        let results = [];
        return new Promise<T[]>((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.openCursor(range);
            request.onsuccess = (event: any) => {
                const cursor = event.target.result;
                if (cursor) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            request.onerror = (event: any) => {
                reject(event.error);
            };
        });
    }

    
    public static async getByIndex<T>(storeName: string, indexName: string, key: any): Promise<T[]> {
        let results = [];
        const db = await IndexDBHelper.openDB();                
        return new Promise<T[]>((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.openCursor(key);
            request.onsuccess = (event: any) => {
                const cursor = event.target.result;
                if (cursor) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            request.onerror = (event: any) => {
                reject(event.error);
            };
        });
    }
}


