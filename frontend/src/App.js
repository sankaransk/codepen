import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    memory_date: '',
    couple_name1: '',
    couple_name2: '',
    tags: '',
    image_data: ''
  });

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/memories`);
      setMemories(response.data);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          image_data: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const memoryData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      
      await axios.post(`${API}/memories`, memoryData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        memory_date: '',
        couple_name1: '',
        couple_name2: '',
        tags: '',
        image_data: ''
      });
      
      setShowCreateForm(false);
      fetchMemories(); // Refresh memories list
    } catch (error) {
      console.error('Error creating memory:', error);
      alert('Error creating memory. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1558715585-9b706788d173?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBtZW1vcmllc3xlbnwwfHx8b3JhbmdlfDE3NTM0NDM2ODR8MA&ixlib=rb-4.1.0&q=85)',
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="relative z-10 px-6 py-24 text-center">
          <h1 className="text-6xl font-bold text-white mb-6 font-serif">
            Our Love Story
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            A beautiful collection of our most precious memories together
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Add New Memory
          </button>
        </div>
      </div>

      {/* Create Memory Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 font-serif">Create New Memory</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partner 1 Name
                    </label>
                    <input
                      type="text"
                      name="couple_name1"
                      value={formData.couple_name1}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partner 2 Name
                    </label>
                    <input
                      type="text"
                      name="couple_name2"
                      value={formData.couple_name2}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Memory Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Our first date, Anniversary celebration, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Memory Date
                  </label>
                  <input
                    type="date"
                    name="memory_date"
                    value={formData.memory_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Tell the story behind this beautiful memory..."
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                  {formData.image_data && (
                    <div className="mt-4">
                      <img
                        src={formData.image_data}
                        alt="Preview"
                        className="max-h-48 rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="anniversary, travel, romantic, etc."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold"
                  >
                    Create Memory
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Memories Timeline */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 font-serif">Our Memory Timeline</h2>
          <p className="text-gray-600">Relive our most beautiful moments together</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            <p className="mt-4 text-gray-600">Loading memories...</p>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-8">
              <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No memories yet</h3>
            <p className="text-gray-500 mb-6">Start creating your beautiful love story!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Add Your First Memory
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-200 via-pink-200 to-rose-200"></div>
              
              {memories.map((memory, index) => (
                <div key={memory.id} className="relative mb-12">
                  {/* Timeline dot */}
                  <div className="absolute left-6 w-4 h-4 bg-rose-500 rounded-full border-4 border-white shadow-md"></div>
                  
                  {/* Memory card */}
                  <div className="ml-20 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      {/* Image section */}
                      {memory.image_data && (
                        <div className="lg:order-1">
                          <img
                            src={memory.image_data}
                            alt={memory.title}
                            className="w-full h-64 lg:h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Content section */}
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-rose-500 font-medium text-sm">
                            {formatDate(memory.memory_date)}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            {memory.couple_name1} & {memory.couple_name2}
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 font-serif">
                          {memory.title}
                        </h3>
                        
                        <p className="text-gray-600 leading-relaxed mb-6">
                          {memory.description}
                        </p>
                        
                        {memory.tags && memory.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {memory.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-sm font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-300">
            "The best love is the kind that awakens the soul and makes us reach for more." 
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Built with love for couples everywhere ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;