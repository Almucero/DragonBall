/**
 * character controller (original)
 *
 *
 * import { factories } from '@strapi/strapi'
 *
 * export default factories.createCoreController('api::character.character');
 */
import { factories } from "@strapi/strapi";

const getImageUrl = (image: any) => {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (image.url) return image.url;
  const d = image.data ?? image;
  if (Array.isArray(d)) return d[0]?.attributes?.url ?? null;
  return d?.attributes?.url ?? null;
};

export default factories.createCoreController(
  "api::character.character",
  ({ strapi }) => ({
    async raw(ctx) {
      const query = ctx.query as Record<string, any>;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const start = (page - 1) * limit;

      const [entities, total] = await Promise.all([
        strapi.entityService.findMany("api::character.character", {
          populate: ["image", "originPlanet"],
          start,
          limit,
          sort: { uid: 'asc' }, 
        }),
        strapi.db.query("api::character.character").count(),
      ]);

      const items = entities.map((e: any) => ({
        id: e.uid,
        name: e.name,
        ki: e.ki,
        maxKi: e.maxKi,
        race: e.race,
        gender: e.gender,
        description: e.description,
        image: getImageUrl(e.image),
        affiliation: e.affiliation,
        deletedAt: e.deletedAt ?? null,
      }));

      const totalPages = Math.ceil((total/2) / limit);
      const baseUrl = `${ctx.request.origin}/api/characters`;
      const makeLink = (p: number) => `${baseUrl}?page=${p}&limit=${limit}`;

      ctx.body = {
        items,
        meta: {
          totalItems: total/2, //58 //si se divide entre 2 va bien por alguna razón
          itemCount: items.length, 
          itemsPerPage: limit, 
          totalPages, //6
          currentPage: page,
        },
        links: {
          first: makeLink(1),
          previous: page > 1 ? makeLink(page - 1) : "",
          next: page < totalPages ? makeLink(page + 1) : "",
          last: makeLink(totalPages),
        },
      };
    },

    async rawOne(ctx) {
      const { id } = ctx.params as { id: string };

      // Buscar por el atributo uid en vez del ID interno
      const entity = await strapi.db.query("api::character.character").findOne({
        where: { uid: Number(id) }, // convertir a número si uid es number
        populate: ["image", "originPlanet"],
      });

      if (!entity) {
        ctx.status = 404;
        ctx.body = { message: "Character not found" };
        return;
      }

      ctx.body = {
        id: entity.uid,
        name: entity.name,
        ki: entity.ki,
        maxKi: entity.maxKi,
        race: entity.race,
        gender: entity.gender,
        description: entity.description,
        image: getImageUrl(entity.image),
        affiliation: entity.affiliation,
        deletedAt: entity.deletedAt ?? null,
      };
    },
  })
);

//total items da más items
//comprobar si se devuelve origin planet y transformations
