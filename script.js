"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

//Main class for the application context
class App {
    //Private properties
    #map;
    #mapEvent;

    constructor() {
        //Initiate the GeoLocation API
        this._getPosition();

        //When user submits the form
        form.addEventListener("submit", this._newWorkout.bind(this));
    }

    //Get the current position when the app loads
    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                () => {
                    alert("Could not get your position!");
                }
            );
        }
    }

    //Load the map with a position defined in arguments
    _loadMap(position) {
        const { latitude, longitude } = position.coords;
        console.log(latitude, longitude);
        console.log(`https://www.google.co.in/maps/@${latitude},${longitude}`);

        //Creating a map with lat and lng with zoom level of 13
        this.#map = L.map("map").setView([latitude, longitude], 15);

        //Choose tile format and add attribution if needed
        L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
            attribution: "",
        }).addTo(this.#map);

        //Add a marker with data when the point is clicked on the map
        this.#map.on("click", this._showForm.bind(this));
    }

    //Show the form to the user when the map is ck
    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove("hidden");
        inputDistance.focus();
    }

    _toggleElevationField() {
        inputType.addEventListener("change", (e) => {
            inputElevation
                .closest(".form__row")
                .classList.toggle("form__row--hidden");
            inputCadence
                .closest(".form__row")
                .classList.toggle("form__row--hidden");
        });
    }

    _newWorkout(e) {
        e.preventDefault();

        //Clear all input fields
        inputDistance.value =
            inputDuration.value =
            inputCadence.value =
            inputElevation.value =
                "";

        //Create a marker in the map with given data
        const { lat, lng } = this.#mapEvent.latlng;
        L.marker([lat, lng])
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    maxHeight: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: "running-popup",
                })
            )
            .setPopupContent("Workout")
            .openPopup();
    }
}

//Initiate app instance
const app = new App();
