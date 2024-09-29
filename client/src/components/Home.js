import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SliderComponent from './SliderComponent';
import './Home.css'; // Custom CSS for styling

const Home = () => {
  const [genres, setGenres] = useState([]);
  const [moviesByGenre, setMoviesByGenre] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allMovies, setAllMovies] = useState([]); // Store all movies for filtering

  // Fetch genres and all movies from TMDB API
  useEffect(() => {
    const fetchGenresAndMovies = async () => {
      try {
        const genreResponse = await axios.get(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=116368c33740a991902b1f15a377032e`
        );
        setGenres(genreResponse.data.genres);

        const allMoviesResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/popular?api_key=116368c33740a991902b1f15a377032e&page=1`
        );
        setAllMovies(allMoviesResponse.data.results);
      } catch (error) {
        console.error("Error fetching genres or movies:", error);
      }
    };

    fetchGenresAndMovies();
  }, []);

  // Fetch movies by genre
  useEffect(() => {
    const fetchMoviesByGenre = async () => {
      const genreMovies = {};
      const promises = genres.map(async (genre) => {
        try {
          const response = await axios.get(
            `https://api.themoviedb.org/3/discover/movie?api_key=116368c33740a991902b1f15a377032e&with_genres=${genre.id}`
          );
          genreMovies[genre.name] = response.data.results;
        } catch (error) {
          console.error(`Error fetching movies for genre ${genre.name}:`, error);
        }
      });

      await Promise.all(promises);
      setMoviesByGenre(genreMovies);
    };

    if (genres.length > 0) {
      fetchMoviesByGenre();
    }
  }, [genres]);

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://localhost:5000/search', {
        prompt: searchQuery,
      });

      const filteredMovieIds = response.data.movie_ids; // Get the filtered movie IDs from the server
      await fetchMoviesByIds(filteredMovieIds); // Fetch movies by IDs from TMDB
    } catch (error) {
      console.error('Error searching for movies:', error);
    }
  };

  // Fetch movies from TMDB by IDs
  const fetchMoviesByIds = async (movieIds) => {
    try {
      const moviePromises = movieIds.map(async (id) => {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=116368c33740a991902b1f15a377032e`
        );
        return response.data; // Return the movie data
      });

      const movies = await Promise.all(moviePromises);
      setSearchResults(movies); // Set the search results
    } catch (error) {
      console.error('Error fetching movies by IDs:', error);
    }
  };

  return (
    <div className="home-page">
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Search Results Slider */}
      {searchResults.length > 0 && (
        <SliderComponent movies={searchResults} title="Search Results" />
      )}

      {/* Genre-based sliders */}
      {genres.map((genre) => (
        <div key={genre.id}>
          {moviesByGenre[genre.name] && (
            <SliderComponent
              movies={moviesByGenre[genre.name]}
              title={`${genre.name} Movies`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Home;
