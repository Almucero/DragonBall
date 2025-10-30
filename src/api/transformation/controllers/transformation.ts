/**
 * transformation controller (original)
 */
// import { factories } from '@strapi/strapi'

// export default factories.createCoreController('api::transformation.transformation');

/**
 * transformation controller (modificado)
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
  "api::transformation.transformation",
  ({ strapi }) => ({

    // === GET /api/transformations ===
    async raw(ctx) {
      const query = ctx.query as Record<string, any>;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const start = (page - 1) * limit;

      const [entities, total] = await Promise.all([
        strapi.entityService.findMany("api::transformation.transformation", {
          start,
          limit,
          sort: { uid: 'asc' },
          populate: ["image"],
        }),
        strapi.db.query("api::transformation.transformation").count(),
      ]);

      const items = entities.map((e: any) => ({
        id: e.uid ?? e.id,
        name: e.name,
        image: getImageUrl(e.image),
        ki: e.ki,
        deletedAt: e.deletedAt ?? null,
      }));

      const totalPages = Math.ceil(total / limit);
      const baseUrl = `${ctx.request.origin}/api/transformations`;
      const makeLink = (p: number) => `${baseUrl}?page=${p}&limit=${limit}`;

      ctx.body = {
        items,
        meta: {
          totalItems: total,
          itemCount: items.length,
          itemsPerPage: limit,
          totalPages,
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

    // === GET /api/transformations/:id ===
    async rawOne(ctx) {
      const { id } = ctx.params as { id: string };

      const entity = await strapi.db.query("api::transformation.transformation").findOne({
        where: { uid: Number(id) },
        populate: {
          image: true,
          character: { populate: ["image"] },
        },
      });

      if (!entity) {
        ctx.status = 404;
        ctx.body = { message: "Transformation not found" };
        return;
      }

      const character = entity.character
        ? {
            id: entity.character.uid ?? entity.character.id,
            name: entity.character.name,
            ki: entity.character.ki,
            maxKi: entity.character.maxKi,
            race: entity.character.race,
            gender: entity.character.gender,
            description: entity.character.description,
            image: getImageUrl(entity.character.image),
            affiliation: entity.character.affiliation,
            deletedAt: entity.character.deletedAt ?? null,
          }
        : null;

      ctx.body = {
        id: entity.uid ?? entity.id,
        name: entity.name,
        image: getImageUrl(entity.image),
        ki: entity.ki,
        deletedAt: entity.deletedAt ?? null,
        character,
      };
    },
  })
);
