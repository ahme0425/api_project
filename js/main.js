// NOTE: This code will NOT WORK AS IS
// You need to FORK this PEN then put your API KEY in the const below
const movieDataBaseURL = "https://api.themoviedb.org/3/";

let imageURL = null;
let imageSizes = [];

document.addEventListener("DOMContentLoaded", init);

function init() {
    addEventListeners();
    getLocalStorageData();

    /*******

    *******/

    document.querySelector("#modalButton").addEventListener("click", showOverlay);
    document
        .querySelector(".cancelButton")
        .addEventListener("click", hideOverlay);
    document.querySelector(".overlay").addEventListener("click", hideOverlay);

    document.querySelector(".saveButton").addEventListener("click", function (e) {
        let cheeseList = document.getElementsByName("cheese");
        let cheeseType = null;
        for (let i = 0; i < cheeseList.length; i++) {
            if (cheeseList[i].checked) {
                cheeseType = cheeseList[i].value;
                break;
            }
        }
        alert(cheeseType);
        console.log("You picked " + cheeseType);
        hideOverlay(e);
    });
}

function showOverlay(e) {
    e.preventDefault();
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("hide");
    overlay.classList.add("show");
    showModal(e);
}

function showModal(e) {
    e.preventDefault();
    let modal = document.querySelector(".modal");
    modal.classList.remove("off");
    modal.classList.add("on");
}

function hideOverlay(e) {
    e.preventDefault();
    e.stopPropagation(); // don't allow clicks to pass through
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("show");
    overlay.classList.add("hide");
    hideModal(e);
}

function hideModal(e) {
    e.preventDefault();
    let modal = document.querySelector(".modal");
    modal.classList.remove("on");
    modal.classList.add("off");
}
//

function addEventListeners() {
    let searchButton = document.querySelector(".searchButtonDiv");
    searchButton.addEventListener("click", startSearch);
}

function getLocalStorageData() {
    // if there is no poster path or sizes data in local storage
    // or if the information is over 60 minutes old (stale)
    // then we need to get that data from TDb using Fetch

    getPosterPathAndSizes();
}

function getPosterPathAndSizes() {
    // we need to create the url, it's a good idea to have a global base url (look at the top of this file)
    // https://developers.themoviedb.org/3/getting-started/introduction
    // https://developers.themoviedb.org/3/configuration/get-api-configuration
    // e.g. https://api.themoviedb.org/3/configuration?api_key=<<api_key>>

    let url = `${movieDataBaseURL}configuration?api_key=${APIKEY}`;

    fetch(url)
        .then(response => response.json())
        .then(function (data) {
            console.log(data);
            imageURL = data.images.secure_base_url;
            imageSizes = data.images.poster_sizes;

            console.log(imageURL);
            console.log(imageSizes);

        })
        .catch((error) => console.log(error));

}

// start the initial seach from the app home page
function startSearch() {
    console.log("start search");
    searchString = document.getElementById("search-input").value;
    if (!searchString) {
        alert("Please enter search data");
        return;
    }

    // this is a new search so you should reset any existing page data

    getSearchResults();
}

// called from startSearch()
function getSearchResults() {
    // https://developers.themoviedb.org/3/search/search-movies  look up search movie (also TV Shows)
    let url = `${movieDataBaseURL}search/movie?api_key=${APIKEY}&query=${searchString}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            //  create the page from data
            createPage(data);

            //  navigate to "results";
        })
        .catch((error) => console.log(error));
}



function createPage(data) {
    let content = document.querySelector("#search-results>.content");
    let title = document.querySelector("#search-results>.title");

    let message = document.createElement("h2");
    content.innerHTML = "";
    title.innerHTML = "";

    if (data.total_results == 0) {
        message.innerHTML = `No reesults found for ${searchString}`;

    } else {
        message.innerHTML = `Total results = ${data.total_results} for ${searchString}`;
    }

    title.appendChild(message);

    let documentFragment = new DocumentFragment();

    documentFragment.appendChild(createMovieCards(data.results));
    content.appendChild(documentFragment);

    let cardList = document.querySelectorAll(".content>div");

    cardList.forEach(function (item) {
        item.addEventListener("click", getRecommendations);
    });
}



function createMovieCards(results) {
    let documentFragment = new DocumentFragment(); // use a documentFragment for performance

    results.forEach(function (movie) {

        let movieCard = document.createElement("div");
        let section = document.createElement("section");
        let image = document.createElement("img");
        let videoTitle = document.createElement("p");
        let videoDate = document.createElement("p");
        let videoRating = document.createElement("p");
        let videoOverview = document.createElement("p");

        videoTitle.textContent = movie.title;
        videoDate.textContent = movie.release_date;
        videoRating.textContent = movie.vote_average;
        videoOverview.textContent = movie.overview;

        image.src = `${imageURL}${imageSizes[2]}${movie.poster_path}`;

        movieCard.setAttribute("data-title", movie.title);
        movieCard.setAttribute("data-id", movie.id);



        movieCard.className = "movieCard";
        section.className = "imageSection";

        // append elements
        section.appendChild(image);
        movieCard.appendChild(section);
        movieCard.appendChild(videoTitle);
        movieCard.appendChild(videoDate);
        movieCard.appendChild(videoRating);
        movieCard.appendChild(videoOverview);

        documentFragment.appendChild(movieCard);


    });

    return documentFragment;
}

function getRecommendations() {
    console.log(this);
    let movieTitle = this.getAttribute("data-title");

    searchString = movieTitle;

    let movieID = this.getAttribute("data-id");

    console.log("you clicked: " + movieTitle + "" + movieID);

    let url = `${movieDataBaseURL}movie/${movieID}/recommendations?api_key=${APIKEY}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            //  create the page from data
            createPage(data);

            //  navigate to "results";
        })
        .catch((error) => console.log(error));
}


//
//function getTVRecommendations() {
//    console.log(this);
//    let movieTitle = this.getAttribute("data-title");
//
//    searchString = movieTitle;
//
//    let movieID = this.getAttribute("data-id");
//
//    console.log("you clicked: " + movieTitle + "" + movieID);
//
//    let url = `${movieDataBaseURL}TV/${ID}/recommendations?api_key=${APIKEY}`;
//    fetch(url)
//        .then(response => response.json())
//        .then(data => {
//            console.log(data);
//
//            //  create the page from data
//            createPage(data);
//
//            //  navigate to "results";
//        })
//        .catch((error) => console.log(error));
//}
