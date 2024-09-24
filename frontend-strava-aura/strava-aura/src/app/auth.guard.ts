import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // return true;
  const token = localStorage.getItem('access_token');
  if (token){
    return true;
  }
  else{
    return false;
  }
};
