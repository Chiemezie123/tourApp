const hideDiv = () => {
  const el = document.querySelector('.alert');
  if (el) {
    window.setTimeout(() => {
      el.parentElement.removeChild(el);
    }, 5000);
  }
};

export const showAlert = (type, message) => {
  hideDiv();
  const showDiv = `<div class ="alert alert--${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', showDiv);
  hideDiv();
};
