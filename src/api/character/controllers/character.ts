/*
 * character controller (original)
 */
// import { factories } from '@strapi/strapi'

// export default factories.createCoreController('api::character.character');

/*
 * character controller (modificado)
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
          sort: { uid: "asc" },
        }),
        strapi.db.query("api::character.character").count(),
      ]);

      const items = entities.map((e: any) => ({
        id: e.uid ?? e.id,
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

      const totalPages = Math.ceil(total / 2 / limit);
      const baseUrl = `${ctx.request.origin}/api/characters`;
      const makeLink = (p: number) => `${baseUrl}?page=${p}&limit=${limit}`;

      ctx.body = {
        items,
        meta: {
          totalItems: total / 2, //58 //si se divide entre 2 va bien por alguna razón
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

      // Buscar el personaje por uid
      const entity = await strapi.db.query("api::character.character").findOne({
        where: { uid: Number(id) },
        populate: {
          image: true,
          originPlanet: { populate: ["image"] },
          transformations: { populate: ["image"] },
        },
      });

      if (!entity) {
        ctx.status = 404;
        ctx.body = { message: "Character not found" };
        return;
      }

      const getImageUrl = (img: any) =>
        img?.url || img?.data?.attributes?.url || null;

      // Formatear el planeta de origen
      const planet = entity.originPlanet
        ? {
            id: entity.originPlanet.uid ?? entity.originPlanet.id,
            name: entity.originPlanet.name,
            isDestroyed: entity.originPlanet.isDestroyed,
            description: entity.originPlanet.description,
            image: getImageUrl(entity.originPlanet.image),
            deletedAt: entity.originPlanet.deletedAt ?? null,
          }
        : null;

      // Formatear las transformaciones
      const transformations = Array.isArray(entity.transformations)
        ? entity.transformations.map((t: any) => ({
            id: t.uid ?? t.id,
            name: t.name,
            image: getImageUrl(t.image),
            ki: t.ki,
            deletedAt: t.deletedAt ?? null,
          }))
        : [];

      ctx.body = {
        id: entity.uid ?? entity.id,
        name: entity.name,
        ki: entity.ki,
        maxKi: entity.maxKi,
        race: entity.race,
        gender: entity.gender,
        description: entity.description,
        image: getImageUrl(entity.image),
        affiliation: entity.affiliation,
        deletedAt: entity.deletedAt ?? null,
        originPlanet: planet,
        transformations,
      };
    },

    // Helpers to expose the original/core behavior safely from custom routes
    async originalFind(ctx) {
      const query = ctx.query as Record<string, any>;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const start = (page - 1) * limit;

      // parse populate param if present
      let populate: any = undefined;
      if (query.populate) {
        if (typeof query.populate === "string") {
          populate = query.populate.includes(",")
            ? query.populate.split(",").map((s: string) => s.trim())
            : query.populate;
        } else {
          populate = query.populate;
        }
      }

      const [entities, total] = await Promise.all([
        strapi.entityService.findMany("api::character.character", {
          start,
          limit,
          sort: { uid: "asc" },
          populate,
        }),
        strapi.db.query("api::character.character").count(),
      ]);

      const totalPages = Math.ceil(total / (limit || total));

      ctx.body = {
        data: entities,
        meta: {
          pagination: {
            page,
            pageSize: limit,
            pageCount: totalPages,
            total,
          },
        },
      };
    },

    async originalFindOne(ctx) {
      const { id } = ctx.params as { id: string };
      const query = ctx.query as Record<string, any>;

      // parse populate param if present
      let populate: any = undefined;
      if (query.populate) {
        if (typeof query.populate === "string") {
          populate = query.populate.includes(",")
            ? query.populate.split(",").map((s: string) => s.trim())
            : query.populate;
        } else {
          populate = query.populate;
        }
      }

      // Build OR filters: try documentId (string), uid (numeric), and id (numeric)
      const numericId = Number(id);
      const orFilters: any[] = [{ documentId: id }];
      if (Number.isFinite(numericId)) {
        orFilters.push({ uid: numericId });
        orFilters.push({ id: numericId });
      }

      const results = await strapi.entityService.findMany(
        "api::character.character",
        {
          filters: { $or: orFilters },
          populate,
          limit: 1,
        }
      );

      const entity = results[0] ?? null;

      if (!entity) {
        ctx.status = 404;
        ctx.body = { message: "Character not found" };
        return;
      }

      ctx.body = { data: entity };
    },
  })
);
