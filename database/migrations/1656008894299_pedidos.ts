import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'pedidos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
      table.string('hash_id').unique().notNullable();
      table.integer('cliente_id').unsigned().references('id').inTable('clientes');
      table
        .integer('estabelecimento_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('estabelecimentos');
      table
        .integer('meio_pagamento_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('meios_pagamentos');

      table
        .integer('pedidos_endereco_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('status_pedidos');
      table.decimal('valor', 10,2).notNullable();
      table.decimal('troco_para', 2, 10).nullable();
      table.decimal('custo_entrega', 10, 2).notNullable().defaultTo(0);
      table.decimal('valor_entrega', 10, 2).notNullable().defaultTo(0);
      table.string('observacao').nullable();
      table.timestamp('created_at').notNullable();
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
