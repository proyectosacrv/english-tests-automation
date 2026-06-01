const ALLOWED=['proyectosacrv@gmail.com','solgncd@gmail.com','alexciuvi6@gmail.com'];
const _email=sessionStorage.getItem('auth_email');
if(!_email||!ALLOWED.includes(_email.toLowerCase())){
  sessionStorage.setItem('auth_dest',window.location.pathname.split('/').pop()||'index.html');
  window.location.href='login.html';
}
