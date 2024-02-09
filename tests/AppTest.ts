import { App } from '../src/App';
import { DatabaseMockClass } from './mocks/DatabaseMockClass';

const database = new DatabaseMockClass();
const { app } = new App(database);

console.log('Lembre-se de que o banco de dados é o mesmo para todos os testes, então se você alterar o banco de dados em um teste, isso afetará os outros testes.');
console.log('Para evitar isso, você pode usar o método "clearDatabase" para limpar o banco de dados antes de cada teste.');
console.log('As funções "getToken" e "getAdminToken" criam um usuário e retornam um token para você usar nos testes.');

const clearDatabase = database.clearDatabase

export { app, clearDatabase };
