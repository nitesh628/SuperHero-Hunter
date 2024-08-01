const publicKey = '3cb76a60734a7c648b85b1f6922b94df';
const privateKey = 'd68f2d6cd7c1db76ae1ce85a2a0fd583e3941656';

function generateHash(ts) {
    return CryptoJS.MD5(ts + privateKey + publicKey).toString().toLowerCase();
}

document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('search');
    searchBar.addEventListener('input', () => fetchSuperheroes(searchBar.value));

    function fetchSuperheroes(query) {
        const ts = new Date().getTime();
        const hash = generateHash(ts);
        const apiUrl = `https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&apikey=${publicKey}&hash=${hash}&nameStartsWith=${query}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => displaySuperheroes(data.data.results))
            .catch(error => console.error('Error fetching data:', error));
    }

    function displaySuperheroes(superheroes) {
        const superheroList = document.getElementById('superhero-list');
        superheroList.innerHTML = '';
        superheroes.forEach(hero => {
            const heroCard = document.createElement('div');
            heroCard.className = 'col-md-4';
            heroCard.innerHTML = `
                <div class="card mb-4" data-hero-id="${hero.id}">
                    <img src="${hero.thumbnail.path}.${hero.thumbnail.extension}" class="card-img-top" alt="${hero.name}">
                    <div class="card-body">
                        <h5 class="card-title">${hero.name}</h5>
                        <button class="btn btn-primary" onclick="addToFavorites(${hero.id})">Add to Favorites</button>
                        <button class="btn btn-secondary" onclick="showHeroDetails(${hero.id})">More Info</button>
                    </div>
                </div>
            `;
            superheroList.appendChild(heroCard);
        });
    }

    window.showHeroDetails = function(heroId) {
        const ts = new Date().getTime();
        const hash = generateHash(ts);
        fetch(`https://gateway.marvel.com:443/v1/public/characters/${heroId}?ts=${ts}&apikey=${publicKey}&hash=${hash}`)
            .then(response => response.json())
            .then(data => {
                const hero = data.data.results[0];
                document.getElementById('hero-name').innerText = hero.name;
                document.getElementById('hero-image').src = `${hero.thumbnail.path}.${hero.thumbnail.extension}`;
                document.getElementById('hero-description').innerText = hero.description || 'No description available.';

                const comicsList = document.getElementById('hero-comics');
                comicsList.innerHTML = '';
                if (hero.comics.items.length > 0) {
                    hero.comics.items.forEach(comic => {
                        const listItem = document.createElement('li');
                        listItem.className = 'list-group-item';
                        listItem.innerText = comic.name;
                        comicsList.appendChild(listItem);
                    });
                } else {
                    const noComicsItem = document.createElement('li');
                    noComicsItem.className = 'list-group-item';
                    noComicsItem.innerText = 'No comics available.';
                    comicsList.appendChild(noComicsItem);
                }

                document.getElementById('home-page').classList.add('hidden');
                document.getElementById('hero-detail-page').classList.remove('hidden');
            })
            .catch(error => console.error('Error fetching data:', error));
    };

    window.addToFavorites = function(heroId) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const ts = new Date().getTime();
        const hash = generateHash(ts);
        fetch(`https://gateway.marvel.com:443/v1/public/characters/${heroId}?ts=${ts}&apikey=${publicKey}&hash=${hash}`)
            .then(response => response.json())
            .then(data => {
                const hero = data.data.results[0];
                if (!favorites.some(fav => fav.id === hero.id)) {
                    favorites.push(hero);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    alert(`${hero.name} has been added to your favorites!`);
                } else {
                    alert(`${hero.name} is already in your favorites!`);
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    };

    document.getElementById('back-to-home-favorites').addEventListener('click', showHomePage);
    function showFavoritesPage() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const favoritesList = document.getElementById('favorites-list');
        favoritesList.innerHTML = '';

        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p>No favorite superheroes added.</p>';
            return;
        }

        favorites.forEach(hero => {
            const heroCard = document.createElement('div');
            heroCard.className = 'col-md-4';
            heroCard.innerHTML = `
                <div class="card mb-4">
                    <img src="${hero.thumbnail.path}.${hero.thumbnail.extension}" class="card-img-top" alt="${hero.name}">
                    <div class="card-body">
                        <h5 class="card-title">${hero.name}</h5>
                        <button class="btn btn-danger" onclick="removeFromFavorites(${hero.id})">Remove from Favorites</button>
                    </div>
                </div>
            `;
            favoritesList.appendChild(heroCard);
        });

        document.getElementById('home-page').classList.add('hidden');
        document.getElementById('favorites-page').classList.remove('hidden');
    }

    window.removeFromFavorites = function(heroId) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const updatedFavorites = favorites.filter(hero => hero.id !== heroId);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        showFavoritesPage();
    };

    document.getElementById('back-to-home').addEventListener('click', showHomePage);
    function showHomePage() {
        document.getElementById('hero-detail-page').classList.add('hidden');
        document.getElementById('favorites-page').classList.add('hidden');
        document.getElementById('home-page').classList.remove('hidden');
    }

    document.getElementById('back-to-home').addEventListener('click', showHomePage);
});