import { showAlert } from './showAlert';

export const updatePasswords = async (event, api) => {
  event.preventDefault();

  const currentPassword = document
    .getElementById('password-current')
    .value.trim();
  const newPassword = document.getElementById('password').value.trim();
  const confirmPassword = document
    .getElementById('password-confirm')
    .value.trim();

  if (!newPassword === confirmPassword) {
    showAlert('error', 'please make sure your new password matches!');
    return;
  }

  const payload = {
    password: currentPassword,
    updatePassword: newPassword,
  };

  console.log(payload, 'my payload');

  try {
    const response = await api.patch('/api/v1/users/updatePassword', payload);
    if (response) {
      console.log(response, 'res res');
      const { message } = response.data;
      showAlert('success', message);

      window.setTimeout(() => {
        location.assign('/userAccount'); // Redirect to refresh the user's session
      }, 1000);
    }
  } catch (err) {
    console.log(err, 'err from password');
    if (err.response) {
      const { message } = err.response.data;
      showAlert('error', message);
    }
  }
};
