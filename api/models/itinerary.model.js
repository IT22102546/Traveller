import mongoose from 'mongoose';

const ItinerarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  categories: { type: [String], required: true }, 
  image: { type: String, required: true },
  averageTime: { type: String, required: true },
  averageCost: { type: String, required: true }, 
  location: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Itinerary', ItinerarySchema);
