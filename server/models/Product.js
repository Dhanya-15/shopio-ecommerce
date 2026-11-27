import mongoose from 'mongoose';

// random rating from 3 to 5 stars (in half-star steps) and a believable review count
export const randomRating = () => Math.round((3 + Math.random() * 2) * 2) / 2;
export const randomReviews = () => 10 + Math.floor(Math.random() * 490);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  category: { type: String, default: 'General' },
  // only used by Shoes, Bags and Watches: who the product is for
  gender: { type: String, enum: ['', 'Men', 'Women'], default: '' },
  countInStock: { type: Number, required: true, min: 0, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: randomRating },
  numReviews: { type: Number, default: randomReviews },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
