"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Workout {
    date = new Date();
    id = (Date.now() + "").slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
        this.calcPace();
    }

    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.cadence;
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

class Cycline extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
    }
}

//ARCHITECTURE COMPONENTS

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

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
        const validInputs = (...inputs) =>
            inputs.every((input) => !Number.isFinite(input));
        e.preventDefault();

        //Get data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;

        //If workout is running, Create running object
        if (type === "running") {
            const cadence = +inputCadence.value;

            //Check if data is valid
            if (!validInputs(distance, duration, cadence))
                return alert("Input have to be positive number!");
        }

        //If workout is cycling, Create cycling object
        if (type === "cycling") {
            const elevation = +inputElevation.value;

            //Check if data is valid
            if (!validInputs(distance, duration, elevation))
                return alert("Input have to be positive number!");
        }

        //Add object to workout array

        //Render workout on map as marker
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

        //Render workout as list

        //Hide the form and clear the input field
        inputDistance.value =
            inputDuration.value =
            inputCadence.value =
            inputElevation.value =
                "";
    }
}

//Initiate app instance
const app = new App();
