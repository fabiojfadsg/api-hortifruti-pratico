import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Estabelecimento from 'App/Models/Estabelecimento';
import User from 'App/Models/user';

export default class extends BaseSeeder {
  public async run () {
    const user = await await User.create({
      email: "estabelecimentos@email.com",
      password: "123456",
      tipo: "estabelecimentos",
    });
    await Estabelecimento.create({
      nome: "Estabelecimento",
      logo: "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
      online: true,
      bloqueado: false,
      userId: user.id,
    });

  }
}
