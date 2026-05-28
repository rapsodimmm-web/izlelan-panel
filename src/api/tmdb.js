import axios from 'axios';

const API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const IMG_ORIGINAL = `${IMAGE_BASE}/original`;
export const IMG_W500 = `${IMAGE_BASE}/w500`;
export const IMG_W300 = `${IMAGE_BASE}/w300`;
export const IMG_W200 = `${IMAGE_BASE}/w200`;

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'tr-TR',
  },
});

// Movies
export const getTrending = () => api.get('/trending/all/week');
export const getPopularMovies = () => api.get('/movie/popular');
export const getTopRatedMovies = () => api.get('/movie/top_rated');
export const getNowPlayingMovies = () => api.get('/movie/now_playing');
export const getUpcomingMovies = () => api.get('/movie/upcoming');
export const getMovieDetails = (id) => api.get(`/movie/${id}`, {
  params: { append_to_response: 'credits,similar,videos,external_ids' }
});

// TV Shows
export const getPopularShows = () => api.get('/tv/popular');
export const getTopRatedShows = () => api.get('/tv/top_rated');
export const getAiringToday = () => api.get('/tv/airing_today');
export const getOnAirShows = () => api.get('/tv/on_the_air');
export const getShowDetails = (id) => api.get(`/tv/${id}`, {
  params: { append_to_response: 'credits,similar,videos,external_ids' }
});
export const getSeasonDetails = (id, season) => api.get(`/tv/${id}/season/${season}`);

// Anime (Animation genre = 16)
export const getAnimeMovies = () => api.get('/discover/movie', {
  params: { with_genres: 16, sort_by: 'popularity.desc' }
});
export const getAnimeShows = () => api.get('/discover/tv', {
  params: { with_genres: 16, sort_by: 'popularity.desc' }
});

// Search
export const searchMulti = (query) => api.get('/search/multi', {
  params: { query, include_adult: false }
});

// Genres
export const getMovieGenres = () => api.get('/genre/movie/list');
export const getTVGenres = () => api.get('/genre/tv/list');

// Discover by genre (paginated)
export const discoverByGenre = (genreId, type = 'movie', page = 1) => 
  api.get(`/discover/${type}`, {
    params: { with_genres: genreId, sort_by: 'popularity.desc', page }
  });

// External IDs (for IMDB — used in M3U generation)
export const getMovieExternalIds = (id) => api.get(`/movie/${id}/external_ids`);
export const getTVExternalIds = (id) => api.get(`/tv/${id}/external_ids`);

// TMDB Image helper
export const tmdbPoster = (path) => path ? `${IMAGE_BASE}/w500${path}` : null;
export const tmdbBackdrop = (path) => path ? `${IMAGE_BASE}/w1280${path}` : null;

export default api;
