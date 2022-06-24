import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import CidadesEstabelecimento from 'App/Models/CidadesEstabelecimento';
import Cliente from 'App/Models/Cliente';
import Endereco from 'App/Models/Endereco';
import Pedido from 'App/Models/Pedido';
import PedidoEndereco from 'App/Models/PedidoEndereco';
import PedidoProduto from 'App/Models/PedidoProduto';
import PedidoStatus from 'App/Models/PedidoStatus';
import Produto from 'App/Models/Produto';

import CreatePedidoValidator from "App/Validators/CreatePedidoValidator";

export default class PedidosController {
    public async store({ request, response, auth }: HttpContextContract) {
        const payload = await request.validate(CreatePedidoValidator);

        const userAuth = await auth.use('api').authenticate();
        const cliente = await Cliente.findByOrFail('user_id', userAuth.id);
        var randomstring = require("randomstring");

        let hash_ok: boolean = false;
        let hash_id: string = "";
        while (hash_ok == false) {
            hash_id = randomstring.generate({
                length: 6,
                charset: 'alphanumeric',
                capitalization: 'uppercase',
            });

            const hash = await Pedido.findByOrFail('hash', hash_id);
            if (hash == null) {
                hash_ok = true;
            }

        }

        //Trasaction criando
        const trx = await Database.transaction();

        const endereco = await Endereco.findByOrFail('id', payload.endereco_id);

        try {
            const end = await PedidoEndereco.create({
                cidadeId: endereco.cidadeId,
                rua: endereco.rua,
                numero: endereco.numero,
                bairro: endereco.bairro,
                pontoReferencia: endereco.pontoReferencia,
                complemento: endereco.complemento,
            });

            //Busca de entrega e calculo valor do pedido
            const estabCidade = await CidadesEstabelecimento.query()
                .where('estabalecimento_id', payload.estabelecimento_id)
                .where('cidade_id', endereco.cidadeId)
                .first();

            let valorValor = 0;
            for await (const produto of payload.produtos) {
                const prod = await Produto.findByOrFail('id', produto.produto_id);
                valorValor += produto.quantidade * prod.preco;
            }

            valorValor = estabCidade ? valorValor + estabCidade.custo_entrega : valorValor;

            valorValor = parseFloat(valorValor.toFixed(2));

            if (payload.troco_para != null && payload.troco_para < valorValor) {
                trx.rollback();
                return response.badRequest("O valor do troco não pode ser menor que o valor do pedido");
            }

            const pedido = await Pedido.create({
                hash_id: hash_id,
                cliente_id: cliente.id,
                estabelecimento_id: payload.estabelecimento_id,
                meio_pagamento_id: payload.meios_pagamento_id,
                troco_para: payload.troco_para,
                pedidos_endereco_id: end.id,
                valor: valorValor,
                custo_entrega: estabCidade ? estabCidade.custo_entrega : 0,
                observacao: payload.observacao,
            });

            payload.produtos.forEach(async (produto) => {
                let getProduto = await Produto.findByOrFail('id', produto.produto_id);

                await PedidoProduto.create({
                    pedido_id: pedido.id,
                    produto_id: produto.produto_id,
                    valor: getProduto.preco,
                    quantidade: produto.quantidade,
                    observacao: produto.observacao,
                });
            });

            await PedidoStatus.create({
                pedido_id: pedido.id,
                status_id: 1,
            });

            //Confirma a transação
            await trx.commit();

            return response.ok(pedido);
        } catch (error) {
            await trx.rollback();
            return response.badRequest("Something went wrong");
        }

    }

    public async index({ response, auth }: HttpContextContract) {
        const userAuth = await auth.use('api').authenticate();
        const cliente = await Cliente.findByOrFail('user_id', userAuth.id);

        const pedidos = await Pedido.query()
            .where('cliente_id', cliente.id)
            .preload('estabelecimento')
            .preload('pedido_status', (statusQuery) => {
                statusQuery.preload('status');
            })
            .orderBy('pedido_id', 'desc');
        return response.json(pedidos);
    }

    public  async show({ params, response, auth }: HttpContextContract) {
        const idPedido = params.hash_id;
        const userAuth = await auth.use('api').authenticate();
        const cliente = await Cliente.findByOrFail('user_id', userAuth.id);

        const pedido = await Pedido.query()
            .where('hash_id', idPedido)
            .preload('produtos', (produtoQuery) => {
                produtoQuery.preload('produto');
            })
            .preload('cliente')
            .preload('endereco')
            .preload('estabelecimento')
            .preload('meios_pagamento')
            .preload('pedido_status', (statusQuery) => {
                statusQuery.preload('status');
            })
            .first();

        if (pedido == null) {
            return response.notFound("Pedido não encontrado");
        }

        return response.json(pedido);
    }

}
