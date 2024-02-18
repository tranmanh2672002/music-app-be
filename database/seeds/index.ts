import mongoose, { model, Schema } from 'mongoose';
import env from 'dotenv';
import { userData } from './user';

(async () => {
    env.config();
    await mongoose.connect(process.env.MONGO_DATABASE_CONNECTION_STRING);
    const seedSchema = new Schema({}, { strict: false });
    const userCollection = model(userData.collectionName, seedSchema);
    await userCollection.insertMany(userData.data);
    console.log(`Seed data done for ${userData.collectionName}`);

    process.exit();
})();
