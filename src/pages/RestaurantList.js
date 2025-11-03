import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Always send searchTerm: empty string "" if no search, or actual search term
      const trimmedSearch = searchTerm.trim();
      const searchQuery = trimmedSearch ? trimmedSearch : '""';
      const response = await api.get(`/place/search?searchTerm=${encodeURIComponent(searchQuery)}`);
      
      // Handle different possible response structures
      const restaurantsData = response.data?.data || response.data || [];
      setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to fetch restaurants');
      console.error('Error fetching restaurants:', error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Initial fetch on mount and when search term changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRestaurants();
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await api.delete(`/place/${id}`);
        fetchRestaurants();
      } catch (error) {
        setError(error.response?.data?.message || error.message || 'Failed to delete restaurant');
        console.error('Error deleting restaurant:', error);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  if (loading && restaurants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Restaurant Management</h1>
              <Link
                to="/restaurants/create"
                className="bg-[#EB422B] text-white px-4 py-2 rounded-md hover:bg-[#EB422B] transition-colors"
              >
                Add New Restaurant
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Search */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-[#EB422B] text-white px-4 py-2 rounded-md hover:bg-[#EB422B] transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Restaurants Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant.id || restaurant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {restaurant.image && (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={`http://localhost:5001/uploads/${restaurant.image}`}
                              alt={restaurant.name}
                            />
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {restaurant.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {restaurant.description || restaurant.email || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {restaurant.address || restaurant.location || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {restaurant.placeType || 'RESTAURANT'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="text-yellow-500">
                            {'★'.repeat(Math.floor(restaurant.ratting || 0))}
                            {'☆'.repeat(5 - Math.floor(restaurant.ratting || 0))}
                          </span>
                          <span className="ml-2 text-gray-500">({restaurant.ratting || 0})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/restaurants/edit/${restaurant.id || restaurant._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(restaurant.id || restaurant._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {restaurants.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No restaurants found.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default RestaurantList;