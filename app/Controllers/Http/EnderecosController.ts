import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cliente from 'App/Models/Cliente';
import Endereco from 'App/Models/Endereco';
import CreateEditEnderecoValidator from 'App/Validators/CreateEditEnderecoValidator';

export default class EnderecosController {

    public async store ({request, auth, response }: HttpContextContract) {
        const payload = await request.validate(CreateEditEnderecoValidator);
        const userAtuh = await auth.use('api').authenticate();
        const cliente = await Cliente.findByOrFail("user_id", userAtuh.id);

        const endereco = await Endereco.create({
            clienteId: payload.cidade_id,
            cidadeId: cliente.id,
            rua: payload.rua,
            numero: payload.numero,
            bairro: payload.bairro,
            pontoReferencia: payload.pontoReferencia,
            complemento: payload.complemento,
        });

        return response.ok(endereco);
    }

    public async index ({auth, response }: HttpContextContract) {
        const userAtuh = await auth.use('api').authenticate();
        const cliente = await Cliente.findByOrFail("user_id", userAtuh.id);

        const getCliente = await Cliente.query()
        .where("id", cliente.id)
        .preload("enderecos", (CidadeQuery) => {
            CidadeQuery.preload("cidade", (queryEstado) => {
                queryEstado.preload("estado");
            });
        })
        .firstOrFail();

        return response.ok(getCliente.enderecos);
    }

    public async update ({request, params, response }: HttpContextContract) {
        const payload = await request.validate(CreateEditEnderecoValidator);
        const endereco = await Endereco.findOrFail(params.id);

        endereco.merge(payload);
        await endereco.save();
        return response.ok(endereco.id);

    }

    public async destroy ({params, response }: HttpContextContract) {
        try {
            const resp = await Endereco.query().where("id", params.id).delete();

            if (resp.includes(1)) {
                return response.noContent();
            } else {
                return response.notFound();
            }
        } catch (error) {
            return response.badRequest();
        }
    }

}
