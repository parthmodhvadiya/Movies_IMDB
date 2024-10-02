import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SliderComponent from './SliderComponent'; // Import your SliderComponent

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  useEffect(() => {
    // Fetch movie details based on the clicked movie's ID
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=116368c33740a991902b1f15a377032e`);
        console.log(response.data)
        setMovie(response.data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
    };

    fetchMovieDetails();
  }, [id]);
  const fetchMoviesByIds = async (movieIds) => {
    try {
      const moviePromises = movieIds.map(async (id) => {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=116368c33740a991902b1f15a377032e`
        );
        return response.data; // Return the movie data
      });

      const movies = await Promise.all(moviePromises);
      console.log(movies)
      setRecommendations(movies);
    } catch (error) {
      console.error('Error fetching movies by IDs:', error);
    }
  };

  useEffect(() => {
    // Fetch recommendations based on the movie ID
    const fetchRecommendations = async () => {
      try {
        console.log(id)
        const response = await axios.post('http://localhost:5000/recommend', { movie_id: id });
        console.log(response)
        const movieIds = fetchMoviesByIds(response.data.movie_ids); // Adjust this based on your backend response structure
        setRecommendations(movieIds);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [id]);

  if (!movie) {
    return <div>Loading movie details...</div>;
  }

  return (
    <div className="movie-details">
      <img 
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
        alt={movie.title} 
      />
      <h2>{movie.title}</h2>
      <p>{movie.overview}</p>
      <p><strong>Release Date:</strong> {movie.release_date}</p>
      <p><strong>Runtime:</strong> {movie.runtime} minutes</p>
      <p><strong>Genres:</strong> {movie.genres.map(genre => genre.name).join(', ')}</p>

      {/* {loadingRecommendations ? (
        <div>Loading recommendations...</div>
      ) : (
        recommendations.length > 0 && (
          <SliderComponent movies={recommendations} title="Recommended Movies" />
        )
      )} */}
      <div className='container-fluid'>
      { loadingRecommendations ? (
        <div>Loading recommendations...</div>
      ) : recommendations.length > 0 && (
        <SliderComponent movies={recommendations} title="Search Results" />
      )}
      </div>
    </div>
  );
};

export default MovieDetails;
