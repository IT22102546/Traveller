export const getRecommendations = async (req, res) => {
    try {
        const { budget, categories } = req.body;

        
        if (!budget || !categories || !Array.isArray(categories)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Budget and categories array are required' 
            });
        }

       
        const response = await fetch('http://localhost:5000/services/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ budget, categories })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
};