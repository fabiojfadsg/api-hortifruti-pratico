import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Admin from 'App/Models/Admin';
import User from 'App/Models/user';

export default class extends BaseSeeder {
  public async run () {
    const user = await await User.create({
      email: "admins@email.com",
      password: "123456",
      tipo: "admins",
    });

    await Admin.create({
      nome: "Admin",
      userId: user.id,
    })
  }
}
