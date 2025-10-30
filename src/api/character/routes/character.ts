/**
 * character router (original)
 *
 *
 * import { factories } from '@strapi/strapi';
 *
 * export default factories.createCoreRouter('api::character.character');
 */
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/characters',
      handler: 'character.raw',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/characters/:id',
      handler: 'character.rawOne',
      config: { auth: false },
    },
  ],
};
