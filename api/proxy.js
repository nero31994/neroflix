const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id=';
let page = 1;
let loading = false;

async function fetchMovies(url, append = false) {
    if (loading) return;
    loading = true;
    document.getElementById("loading").style.display = "block";

    try {
        const res = await fetch(url);
        const data = await res.json();
        document.getElementById("loading").style.display = "none";
        loading = false;

        if (!data.results || data.results.length === 0) {
            document.getElementById("error").innerText = "No movies found!";
            return;
        }

        document.getElementById("error").innerText = "";
        displayMovies(data.results, append);
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching movies!";
        document.getElementById("loading").style.display = "none";
        loading = false;
    }
}

function displayMovies(movies, append) {
    const moviesDiv = document.getElementById("movies");
    if (!append) moviesDiv.innerHTML = "";

    movies.forEach(movie => {
        if (!movie.poster_path) return;
        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}">
            <div class="overlay">${movie.title}</div>
        `;
        movieEl.onclick = () => window.open(`${PROXY_URL}${movie.id}`, "_blank");
        moviesDiv.appendChild(movieEl);
    });
}

function debounceSearch() {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        const query = document.getElementById("search").value;
        if (query.length > 2) {
            fetchMovies(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
        } else {
            fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
        }
    }, 300);
}

function fetchCategory(category) {
    fetchMovies(`https://api.themoviedb.org/3/movie/${category}?api_key=${API_KEY}`);
}

window.onscroll = function () {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        page++;
        fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`, true);
    }
};

function toggleMenu() {
    document.querySelector(".side-nav").classList.toggle("open");
}

// Load popular movies initially
fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
