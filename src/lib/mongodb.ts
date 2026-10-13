import mongoose, { Mongoose } from 'mongoose'

declare global {

    var mongooseCache: {
        conn: Mongoose | null
        promise: Promise<Mongoose> | null
    } | undefined
}

const cached = global.mongooseCache ?? { conn: null, promise: null }

if (!global.mongooseCache) {
    global.mongooseCache = cached
}

async function dbConnect(): Promise<Mongoose> {
    const MONGODB_URI = process.env.MONGODB_URI

    if (!MONGODB_URI) {
        throw new Error('يرجى تعريف متغير البيئة MONGODB_URI داخل ملف .env.local')
    }

    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        }

        cached.promise = mongoose.connect(MONGODB_URI, opts)
    }

    try {
        cached.conn = await cached.promise
    } catch (e) {
        cached.promise = null
        throw e
    }

    return cached.conn
}

export default dbConnect