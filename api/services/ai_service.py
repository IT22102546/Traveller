from flask import Flask, request, jsonify
import numpy as np
from sklearn.neighbors import NearestNeighbors
from pymongo import MongoClient
import certifi

app = Flask(__name__)

# MongoDB Atlas connection
MONGODB_URI = "mongodb+srv://sanjananim2001:22501sndnt@travelapp.vxhgd.mongodb.net/test?retryWrites=true&w=majority"

try:
    client = MongoClient(MONGODB_URI, tlsCAFile=certifi.where())
    db = client['test']  
    itineraries_collection = db['itineraries']  
    
    # Test connection
    print("Database connected successfully!")
    print(f"Total itineraries: {itineraries_collection.count_documents({})}")
    print("Sample itinerary:", itineraries_collection.find_one())
    
except Exception as e:
    print(f"MongoDB connection error: {e}")
    raise

@app.route('/services/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        budget = float(data['budget'])
        categories = data['categories']
        price_range = 2000  # ±2000 price range
        
        # First try to find exact price matches with category match
        exact_matches = list(itineraries_collection.find({
            'categories': {'$in': categories},
            'averageCost': str(budget).strip()  # Strip whitespace from comparison
        }))
        
        # If no exact matches, look within price range
        if not exact_matches:
            price_query = {
                'categories': {'$in': categories},
                '$expr': {
                    '$and': [
                        {'$gte': [
                            {'$toDouble': {'$trim': {'input': '$averageCost'}}}, 
                            budget - price_range
                        ]},
                        {'$lte': [
                            {'$toDouble': {'$trim': {'input': '$averageCost'}}}, 
                            budget + price_range
                        ]}
                    ]
                }
            }
            range_matches = list(itineraries_collection.find(price_query))
        else:
            range_matches = []
        
        # Combine results (exact matches first, then range matches)
        results = []
        for match in exact_matches:
            try:
                results.append({
                    '_id': str(match['_id']),
                    'title': match['title'],
                    'categories': match['categories'],
                    'image': match['image'],
                    'averageTime': match['averageTime'],
                    'averageCost': float(match['averageCost'].strip()),
                    'location': match['location'],
                    'description': match.get('description', 'No description available'),
                    'priceMatch': 'Exact price match'
                })
            except (KeyError, ValueError) as e:
                print(f"Skipping invalid itinerary: {e}")
                continue
        
        for match in range_matches:
            try:
                cost = float(match['averageCost'].strip())
                results.append({
                    '_id': str(match['_id']),
                    'title': match['title'],
                    'categories': match['categories'],
                    'image': match['image'],
                    'averageTime': match['averageTime'],
                    'averageCost': cost,
                    'location': match['location'],
                    'description': match.get('description', 'No description available'),
                    'priceMatch': (
                        'Under budget by Rs {:.2f}'.format(budget - cost) if cost < budget else
                        'Over budget by Rs {:.2f}'.format(cost - budget)
                    )
                })
            except (KeyError, ValueError) as e:
                print(f"Skipping invalid itinerary: {e}")
                continue
        
        if not results:
            return jsonify({
                'success': False,
                'error': 'No itineraries found matching both categories and price criteria'
            }), 404
        
        # Sort by price proximity to budget
        results.sort(key=lambda x: abs(x['averageCost'] - budget))
        
        return jsonify({
            'success': True,
            'recommendations': results[:5],  # Return top 5 closest matches
            'meta': {
                'budget': budget,
                'price_range': price_range,
                'categories': categories,
                'num_exact_matches': len(exact_matches)
            }
        })
        
    except Exception as e:
        print(f"Error in recommendation: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)