import Route from '@ioc:Adonis/Core/Route'

//Login para os 3 tipos de usuários
Route.post('/login', 'AuthController.login');
Route.post('logout', 'AuthController.logout');

Route.group(() => {
  Route.get('auth/me', 'AuthController.me');
}).middleware('auth');

Route.get('/', async () => {
  return { hortifruti: 'prático' }
})
