import { Mutex } from "async-mutex";

class AtomicInt {
    constructor(value) {
        this.value = value;
        this.mutex = new Mutex();
    }

    async incrementAndGet(delta = 1) {
        const release = await this.mutex.acquire();
        try {
            this.value += delta;
            return this.value;
        } finally {
            release();
        }
    }

    async getAndIncrement(delta = 1) {
        const release = await this.mutex.acquire();
        try {
            let oldValue = this.value;
            this.value += delta;
            return oldValue;
        } finally {
            release();
        }
    }

}

export { AtomicInt }