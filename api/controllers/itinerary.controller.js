import Itinerary from '../models/itinerary.model.js';

export const createItinerary = async (req, res) => {
  try {
    const { title, categories, image, averageTime, averageCost, location } = req.body;

    if (!title || !categories.length || !image || !averageTime || !averageCost || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const timeMatch = averageTime.match(/^(\d+)\s*(hours?|HOURS?|Hours?|Hour?|HOUR?|hour?)$/);
    
    if (!timeMatch) {
      return res.status(400).json({ message: 'Invalid averageTime format. Use "X Hours"' });
    }

    const timeValue = parseInt(timeMatch[1], 10);

    if (timeValue > 100) {
      return res.status(400).json({ message: 'Average time should be less than or equal to 100 hours' });
    }

    const newItinerary = new Itinerary({ title, categories, image, averageTime, averageCost, location });
    await newItinerary.save();
    res.status(201).json(newItinerary);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



export const getItineraries = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm || ""; 

 
    const itineraries = await Itinerary.find({
      title: { $regex: searchTerm, $options: "i" }, 
    });

    res.status(200).json(itineraries);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getItineraryById = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.status(200).json(itinerary);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItinerary = await Itinerary.findByIdAndDelete(id);

    if (!deletedItinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.status(200).json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateItinerary = async (req, res) => {
  try {
    const { averageTime } = req.body;


    if (averageTime) {
      const timeMatch = averageTime.match(/^(\d+)\s*(hours?|HOURS?|Hours?|Hour?|HOUR?|hour?)$/);

      if (!timeMatch) {
        return res.status(400).json({ message: 'Invalid averageTime format. Use "X Hours"' });
      }

      const timeValue = parseInt(timeMatch[1], 10);
      if (isNaN(timeValue) || timeValue > 100) {
        return res.status(400).json({ message: 'Average time should be less than or equal to 100 hours' });
      }
    }

    const updatedItinerary = await Itinerary.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedItinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.status(200).json(updatedItinerary);
  } catch (error) {
    console.error('Error updating itinerary:', error); 
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
