import express from 'express';
import { createItinerary, deleteItinerary, getItineraries, getItineraryById, updateItinerary } from '../controllers/itinerary.controller.js';

const router = express.Router();

router.post('/create', createItinerary);
router.get('/', getItineraries);
router.get('/:id', getItineraryById);
router.delete('/:id', deleteItinerary);
router.put('/:id', updateItinerary);


export default router;
