import { mapContainer } from './map';
import mapboxgl from 'mapbox-gl'; // Import Mapbox library
// Select the form element
import { showAlert } from './showAlert';
import { logout } from './logout';
import { updateUser, updateForm } from './updateForm';
import { updatePasswords } from './updatePassword';
import axios from 'axios';
import { bookingSession } from './booking';

const api = axios.create({
  baseURL: 'http://127.0.0.1:3000', // Base URL
});

const tourIde = document.getElementById('tourism');
if (tourIde) {
  console.log(tourIde);
  tourIde.addEventListener('click', (e) => {
    const { tourId } = e.target.dataset;
    const mainId = JSON.parse(tourId);
    console.log(mainId, 'beautiful');
    bookingSession(api, mainId);
  });
}

let locations = document.getElementById('map');
// mao display

if (locations) {
  locations = JSON.parse(locations.dataset.locations);
  mapContainer(locations);
}

// logout
const logoutButton = document.querySelector('.logout');
if (logoutButton) logoutButton.addEventListener('click', logout);

// updateUser

if (updateForm) {
  updateForm.addEventListener('submit', (event) => updateUser(event, api));
}

// updatePassword
const updatePassword = document.querySelector('.form-user-password');
if (updatePassword) {
  updatePassword.addEventListener('submit', (event) =>
    updatePasswords(event, api)
  );
}

// login
const form = document.querySelector('form');
// Add a 'submit' event listener to the form
if (form)
  form.addEventListener('submit', async (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the input value
    const emailValue = document.getElementById('email').value;
    console.log('Submitted value:', emailValue);

    const passwordValue = document.getElementById('password').value;
    console.log('Submitted value:', passwordValue);

    if (!emailValue || !passwordValue) return;

    try {
      const response = await api.post('/api/v1/users/login', {
        email: emailValue,
        password: passwordValue,
      });

      console.log(response, 'response from data');
      if (response) {
        const { status } = response.data;
        showAlert('success', status);

        window.setTimeout(() => {
          console.log('is this function working');
          location.assign('/');
        }, 1500);
      }
    } catch (err) {
      if (err.response) {
        const { message } = err.response.data;
        showAlert('error', message);
      }
    }
  });

// login button

const getButton = document.getElementById('login_btn');

if (getButton) {
  getButton.addEventListener('click', () => {
    window.setTimeout(() => {
      console.log('is this function working');
      location.assign('/login');
    }, 1000);
  });
}

// document.addEventListener('DOMContentLoaded', () => {
//   const tourIde = document.getElementById('tourism');
//   if (tourIde) {
//     console.log(tourIde);
//     tourIde.addEventListener('click', (e) => {
//       console.log('Button clicked');
//       const { tourId } = e.target.dataset;
//       bookingSession(api, tourId);
//     });
//   } else {
//     console.error('Button not found');
//   }
// });
