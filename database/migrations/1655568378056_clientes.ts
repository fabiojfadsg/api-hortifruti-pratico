import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'clientes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('cascade');
      table.string('nome').notNullable();
      table.string('telefone', 15).notNullable();
      table.timestamp('update_at').notNullable();
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
