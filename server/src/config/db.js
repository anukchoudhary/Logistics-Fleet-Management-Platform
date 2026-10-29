const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri && !uri.includes('<username>')) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] Connected to MongoDB Atlas / Server at: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[Database] Warning: Could not connect to configured MONGO_URI (${err.message}). Falling back to in-memory instance for testing/development.`);
    }
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const memoryUri = memoryServerInstance.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] Running on MongoMemoryServer instance: ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.error(`[Database] Failed to connect to in-memory MongoDB: ${memErr.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
