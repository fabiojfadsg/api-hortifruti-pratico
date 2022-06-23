import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Cidade from 'App/Models/Cidade';
import CidadesEstabelecimento from 'App/Models/CidadesEstabelecimento';
import Estabelecimento from 'App/Models/Estabelecimento';
import Estado from 'App/Models/Estado';
import User from 'App/Models/user';
import { faker } from '@faker-js/faker';

export default class extends BaseSeeder {
  public async run() {
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

    for (let i = 2; i <= 20; i++) {
      await User.create({
        email: `estabelecimento${i}@email.com`,
        password: '12345678',
        tipo: 'estabelecimento',
      })
    }

    for (let i = 2; i <= 20; i++) {
      await Estabelecimento.create({
        nome: `Estabelecimento ${i}`,
        logo: `https://picsum.photos/id/${i}/200/200`,
        online: true,
        bloqueado: false,
        userId: i,
      })
    }

    await Estado.createMany([
      {
        nome: 'Minas Gerais',
        uf: 'MG',
      },
      {
        nome: 'São Paulo',
        uf: 'SP',
      },
    ]);

    await Cidade.createMany([
      {
        nome: 'Uberlândia',
        estado_id: 1,
        ativo: true,
      },
      {
        nome: 'Sorocaba',
        estado_id: 2,
        ativo: true,
      },
  
    ]);

    for (let i = 1; i <= 20; i++) {
      await CidadesEstabelecimento.create({
        cidade_id: faker.datatype.number({ min: 1, max: 2 }),
        estabelecimento_id: i,
        custo_entrega: faker.datatype.float({ min: 0, max: 3, precision: 0.5 }),
      });
    }
  }
}
