import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import { useSelector } from 'react-redux';

function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [benefitsRef, benefitsInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [packagesRef, packagesInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const benefits = [
    {
      title: "Exclusive Deals",
      description: "Access members-only discounts on travel packages",
      icon: "🎁",
      bgColor: "bg-blue-50"
    },
    {
      title: "Personalized Itineraries",
      description: "Get custom travel plans tailored to you",
      icon: "✈️",
      bgColor: "bg-purple-50"
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock travel assistance",
      icon: "🛎️",
      bgColor: "bg-green-50"
    },
    {
      title: "Community Access",
      description: "Connect with fellow travelers",
      icon: "👥",
      bgColor: "bg-yellow-50"
    }
  ];


  const handleBookNow = (packageId) => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    
    navigate(`/order/${packageId}`);
  };


  useEffect(() => {
    const fetchTravelData = async () => {
      try {
        const response = await fetch('/api/itinary', {  
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch travel data');
        }
        
        const data = await response.json();
        
        const formattedPackages = data.map(item => ({
          id: item._id, 
          title: item.title,  
          price: item.averageCost,  
          description: `${item.averageTime} in ${item.location}`,  
          image: item.image, 
          categories: item.categories  
        }));
        
        setPackages(formattedPackages.slice(0, 3)); 
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        
        setPackages([
          {
            id: "demo1",
            title: "Bali Getaway",
            price: "$1,499",
            description: "7 days in Bali",
            image: "https://images.unsplash.com/photo-1518544866330-95bcdc8224e1",
            categories: ["Beach", "Luxury"]
          },
          {
            id: "demo2",
            title: "Japan Explorer",
            price: "$2,799",
            description: "10 days in Japan",
            image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3",
            categories: ["Cultural", "Adventure"]
          },
          {
            id: "demo3",
            title: "Swiss Alps Adventure",
            price: "$1,899",
            description: "6 days in Swiss Alps",
            image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5",
            categories: ["Mountain", "Adventure"]
          }
        ]);
      }
    };

    fetchTravelData();
  }, []);

  return (
    <div className="font-sans text-gray-800">
   
      <section 
        ref={heroRef}
        className="relative h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1503220317375-aaad61436b1b')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <motion.div
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={fadeIn}
          className="z-10 text-center px-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Discover Your Next Adventure</h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto">
            Join a community of passionate travelers exploring the world
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-8 rounded-full text-lg transition-all"
            onClick={() => navigate('/sign-up')}
          >
            Join Our Community →
          </motion.button>
        </motion.div>
      </section>

     
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Travel in Style</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Whether it's beautiful destinations or thrilling experiences, ignite your wanderlust and discover new reasons to travel and explore.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all"
            >
              <div className="h-48 bg-[url('https://images.unsplash.com/photo-1530521954074-e64f6810b32d')] bg-cover bg-center"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Luxury Escapes</h3>
                <p className="text-gray-600 mb-4">Indulge in premium travel experiences</p>
                <button className="text-amber-500 font-semibold">Explore →</button>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all"
            >
              <div className="h-48 bg-[url('https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd')] bg-cover bg-center"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Adventure Trips</h3>
                <p className="text-gray-600 mb-4">Thrilling experiences for adrenaline seekers</p>
                <button className="text-amber-500 font-semibold">Explore →</button>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all md:col-span-2 lg:col-span-1"
            >
              <div className="h-48 bg-[url('https://images.unsplash.com/photo-1501555088652-021faa106b9b')] bg-cover bg-center"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Cultural Journeys</h3>
                <p className="text-gray-600 mb-4">Immerse yourself in local traditions</p>
                <button className="text-amber-500 font-semibold">Explore →</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

     
      <section ref={benefitsRef} className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate={benefitsInView ? "visible" : "hidden"}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Member Benefits</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Enjoy exclusive perks when you join our travel community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${benefit.bgColor} p-8 rounded-xl shadow-md`}
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
     
   
      <section ref={packagesRef} className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate={packagesInView ? "visible" : "hidden"}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Travel Packages</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Handpicked experiences curated by our travel experts
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-all"
                >
                  <div 
                    className="h-64 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${pkg.image})` }}
                  ></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{pkg.title}</h3>
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {pkg.price} Per Person
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{pkg.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pkg.categories?.map((category, i) => (
                        <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {category}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleBookNow(pkg.id)} // Updated to use handleBookNow
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                    >
                      Book Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="py-6 px-4 bg-gray-900 text-white text-center">
        <p>© {new Date().getFullYear()} Travel Community. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;