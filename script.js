"use strict";

class Workout {
    date = new Date();
    id = (Date.now() + "").slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }

    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        // prettier-ignore
        this.desciption = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]}`;
    }
}

class Running extends Workout {
    type = "running";

    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace() {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    type = "cycling";

    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
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
    #workouts = [];
    #mapZoomLevel = 15;

    constructor() {
        //Initiate the GeoLocation API
        this._getPosition();

        //When user submits the form
        form.addEventListener("submit", this._newWorkout.bind(this));

        //When user clicks on the map card, move to that position
        containerWorkouts.addEventListener(
            "click",
            this._moveToPopup.bind(this)
        );
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

        //Creating a map with lat and lng with zoom level of 15
        this.#map = L.map("map").setView(
            [latitude, longitude],
            this.#mapZoomLevel
        );

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

    //Hide the form
    _hideForm() {
        //Hide the form and clear the input field
        inputDistance.value =
            inputDuration.value =
            inputCadence.value =
            inputElevation.value =
                "";
        form.style.display = "none";
        form.classList.add("hidden");
        setTimeout(() => {
            form.style.display = "grid";
        }, 1000);
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
            inputs.every((input) => !Number.isFinite(input)); //Check if inputs are numbers

        const allPositive = (...inputs) => inputs.every((input) => input > 0); //Check if inputs are positive

        //Prevent default behaviour of form
        e.preventDefault();

        //Get data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;

        //If workout is running, Create running object
        if (type === "running") {
            const cadence = +inputCadence.value;

            //Check if input provided is valid
            if (
                !validInputs(distance, duration, cadence) &&
                !allPositive(distance, duration, cadence)
            )
                return alert("Input have to be positive number!");
            //Create new running workout
            workout = new Running([lat, lng], distance, duration, cadence);
        }

        //If workout is cycling, Create cycling object
        if (type === "cycling") {
            const elevation = +inputElevation.value;

            //Check if input provided is valid
            if (
                !validInputs(distance, duration, elevation) &&
                !allPositive(distance, duration)
            )
                return alert("Input have to be positive number!");

            //Create new cycling workout
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        //Add the workout to the list of workouts
        this.#workouts.push(workout);

        //Render workout on map as marker
        this._renderWorkoutMarker(workout);

        //Render workout as list
        this._renderWorkoutList(workout);

        this._hideForm();
    }

    _renderWorkoutMarker(workout) {
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    maxHeight: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                })
            )
            .setPopupContent(
                `${workout.type === "running" ? "🏃" : "🚴‍♀️"} ${
                    workout.desciption
                }`
            )
            .openPopup();
    }

    _renderWorkoutList(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.desciption}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
                workout.type === "running" ? "🏃" : "🚴‍♀️"
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          
        `;

        if (workout.type === "running") {
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🦶</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">m</span>
            </div>

        </li>
            `;
        }

        if (workout.type === "cycling") {
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">m</span>
            </div>

        </li>
            `;
        }

        form.insertAdjacentHTML("afterend", html);
    }

    _moveToPopup(e) {
        const workoutElement = e.target.closest(".workout");

        if (!workoutElement) return;
        const workout = this.#workouts.find(
            (workout) => workout.id === workoutElement.dataset.id
        );

        console.log(workout);

        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            },
        });
    }
}

//Initiate app instance
const app = new App();
