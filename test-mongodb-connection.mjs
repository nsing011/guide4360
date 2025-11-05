import { MongoClient } from 'mongodb';

const connectionString = "mongodb+srv://nsing011_db_user:piyvAQafalP8Ic5H@cluster0.u4hedbc.mongodb.net/guide4360?retryWrites=true&w=majority&authSource=admin";

console.log('Testing MongoDB connection...');
console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@'));

const client = new MongoClient(connectionString);

try {
  await client.connect();
  console.log('✅ Successfully connected to MongoDB!');
  
  const db = client.db('guide4360');
  const collections = await db.listCollections().toArray();
  console.log('✅ Database access confirmed');
  console.log('Collections:', collections.map(c => c.name).join(', ') || 'No collections yet');
  
  await client.close();
  console.log('✅ Connection closed');
  process.exit(0);
} catch (error) {
  console.error('❌ Connection failed:', error.message);
  console.error('Error code:', error.code);
  console.error('Error name:', error.name);
  
  if (error.message.includes('Authentication failed')) {
    console.error('\n🔑 Authentication Error - Possible solutions:');
    console.error('1. Check username and password in MongoDB Atlas');
    console.error('2. Verify the user has access to the "guide4360" database');
    console.error('3. Check if the password contains special characters that need URL encoding');
  }
  
  process.exit(1);
}

