import React, { Component } from "react";

import Titles from "./components/Titles";
import Form from "./components/Form";
import Weather from "./components/Weather";

console.log(`${process.env.OPEN_WEATHER_MAPS_KEY}`);
console.log(typeof process.env.REACT_APP_DARK_SKY_KEY);

const OWM_API_KEY = `${process.env.REACT_APP_OPEN_WEATHER_MAPS_KEY}`;
const DS_API_KEY = `${process.env.REACT_APP_DARK_SKY_KEY}`;
const OCD_API_KEY = `${process.env.REACT_APP_OPEN_CAGE_DATA_KEY}`;

export class App extends Component {
    state = {
        temperature: undefined,
        city: undefined,
        country: undefined,
        humidity: undefined,
        description: undefined,
        error: undefined
    };

    componentDidMount() {
        let long;
        let lat;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                long = position.coords.longitude;
                lat = position.coords.latitude;
                console.log(long, lat);
                const proxy = "https://cors-anywhere.herokuapp.com/";
                const dark_sky_api = `${proxy}https://api.darksky.net/forecast/${DS_API_KEY}/${lat},${long}`;

                fetch(dark_sky_api)
                    .then(response => {
                        return response.json();
                    })
                    .then(data => {
                        const {
                            temperature,
                            summary,
                            humidity
                        } = data.currently;

                        const location_api = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${long}&key=${OCD_API_KEY}`;

                        fetch(location_api)
                            .then(response => {
                                return response.json();
                            })
                            .then(location_data => {
                                const {
                                    city,
                                    country
                                } = location_data.results[0].components;

                                this.setState(() => ({
                                    temperature: Math.floor(
                                        (temperature - 32) * (5 / 9)
                                    ),
                                    city: city,
                                    country: country,
                                    humidity: humidity,
                                    description: summary,
                                    error: ""
                                }));
                            });
                    });
            });
        } else {
            this.setState(() => ({
                error: "Please enter the values"
            }));
        }
    }

    getWeather = async e => {
        e.preventDefault();

        const city = e.target.elements.city.value;
        const country = e.target.elements.country.value;
        const api_call = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${OWM_API_KEY}&units=metric`
        );
        const data = await api_call.json();

        if (city && country) {
            console.log(data);
            console.log(typeof data.cod);
            if (data.cod === "404") {
                this.setState(() => ({
                    temperature: undefined,
                    city: undefined,
                    country: undefined,
                    humidity: undefined,
                    description: undefined,
                    error: "Input doesn't match any known location!"
                }));
            } else {
                this.setState(() => ({
                    temperature: data.main.temp,
                    city: data.name,
                    country: data.sys.country,
                    humidity: data.main.humidity,
                    description: data.weather[0].description,
                    error: ""
                }));
            }
        } else {
            this.setState(() => ({
                error: "Please enter the values"
            }));
        }
    };

    render() {
        return (
            <div>
                <div className="wrapper">
                    <div className="main">
                        <div className="container">
                            <div className="row">
                                <div className="col-5 title-container">
                                    <Titles />
                                </div>
                                <div className="col-7 form-container">
                                    <Form getWeather={this.getWeather} />
                                    <Weather
                                        temperature={this.state.temperature}
                                        city={this.state.city}
                                        country={this.state.country}
                                        humidity={this.state.humidity}
                                        description={this.state.description}
                                        error={this.state.error}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
