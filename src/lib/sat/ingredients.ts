import type { Ingredient, IngredientId } from "./types";

/**
 * Catálogo de ingredientes = conjunto de variables booleanas de la fórmula SAT.
 * Las rutas de imagen apuntan a /public/sat/ingredients; si un archivo no
 * existe, la UI cae a su emoji mediante <SafeImage />.
 */
export const INGREDIENTS: readonly Ingredient[] = [
  { id: "tomato", name: "Tomate", imagePath: "/sat/ingredients/tomato.png", emoji: "🍅" },
  { id: "cheese", name: "Queso", imagePath: "/sat/ingredients/cheese.png", emoji: "🧀" },
  { id: "onion", name: "Cebolla", imagePath: "/sat/ingredients/onion.png", emoji: "🧅" },
  { id: "mushroom", name: "Champiñón", imagePath: "/sat/ingredients/mushroom.png", emoji: "🍄" },
  { id: "basil", name: "Albahaca", imagePath: "/sat/ingredients/basil.png", emoji: "🌿" },
  { id: "pepper", name: "Picante", imagePath: "/sat/ingredients/pepper.png", emoji: "🌶️" },
  { id: "garlic", name: "Ajo", imagePath: "/sat/ingredients/garlic.png", emoji: "🧄" },
  { id: "butter", name: "Mantequilla", imagePath: "/sat/ingredients/butter.png", emoji: "🧈" },
] as const;

export const ALL_INGREDIENT_IDS: readonly IngredientId[] = INGREDIENTS.map(
  (i) => i.id
);

const INGREDIENT_MAP: Record<IngredientId, Ingredient> = INGREDIENTS.reduce(
  (acc, ingredient) => {
    acc[ingredient.id] = ingredient;
    return acc;
  },
  {} as Record<IngredientId, Ingredient>
);

export function getIngredient(id: IngredientId): Ingredient {
  return INGREDIENT_MAP[id];
}
