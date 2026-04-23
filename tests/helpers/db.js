import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
 
let mongod
 
async function connect() {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  await mongoose.connect(uri)
}
 
async function disconnect() {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  if (mongod) await mongod.stop()
}
 
async function clearDatabase() {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}
 
export { connect, disconnect, clearDatabase }
 