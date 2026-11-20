import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

const email = 'admin@shop.com';
const password = 'admin123';

await mongoose.connect(process.env.MONGO_URI);

const user = await User.findOne({ email });
if (user) {
  user.password = password;
  user.isAdmin = true;
  await user.save();
  console.log('Existing account updated and made admin.');
} else {
  await User.create({ name: 'Admin', email, password, isAdmin: true });
  console.log('Admin account created.');
}
console.log(`Log in with: ${email} / ${password}`);

await mongoose.disconnect();