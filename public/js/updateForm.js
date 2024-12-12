import { showAlert } from './showAlert';

export const updateForm = document.querySelector('.form-user-data');

export const updateUser = async (event, api) => {
  // Prevent the form's default submission behavior
  event.preventDefault();

  const formData = new FormData(updateForm);
  // Fetch the current values of the input fields directly
  // const fileInput = document.querySelector('.form__upload');
  // const selectedFile = fileInput.files[0];

  // if (selectedFile) {
  //   formData.append('photo', selectedFile); // Add the file to the FormData object
  // }

  // Add other fields
  // formData.append('name', updateForm.querySelector('#name').value);
  // formData.append('email', updateForm.querySelector('#emails').value);

  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const response = await api.patch('/api/v1/users/updateMe', formData);
    if (response) {
      const { message } = response.data;
      showAlert('success', message);

      window.setTimeout(() => {
        console.log('is this function working');
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    if (err.response) {
      const { message } = err.response.data;
      showAlert('error', message);
    }
  }
};
