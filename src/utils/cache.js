// Sistema de cache simples para reduzir chamadas à API
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

class CacheManager {
    constructor() {
        this.cache = new Map();
    }

    set(key, value, duration = CACHE_DURATION) {
        const expiresAt = Date.now() + duration;
        this.cache.set(key, { value, expiresAt });
    }

    get(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        // Verifica se expirou
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    clear(key) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    has(key) {
        const item = this.cache.get(key);
        if (!item) return false;
        
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return false;
        }
        
        return true;
    }
}

export const apiCache = new CacheManager();
