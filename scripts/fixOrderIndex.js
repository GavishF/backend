import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixOrderIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop the bad index if it exists
    try {
      await db.collection('orders').dropIndex('orderID_1');
      console.log('✓ Dropped bad orderID_1 index');
    } catch (err) {
      console.log('✓ orderID_1 index does not exist (expected)');
    }

    // Verify collection exists
    const collections = await db.listCollections().toArray();
    const ordersCollection = collections.find(c => c.name === 'orders');
    
    if (ordersCollection) {
      const indexes = await db.collection('orders').getIndexes();
      console.log('Current indexes:', Object.keys(indexes));
    }

    console.log('✓ Order index fix complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing order index:', error.message);
    process.exit(1);
  }
};

fixOrderIndex();
